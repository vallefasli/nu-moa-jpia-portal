import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // 1. Fetch User Stats (Active vs Pending)
  const { data: activeUsers } = await supabase.from('users').select('id', { count: 'exact' }).eq('account_status', 'active')
  const { data: pendingUsers } = await supabase.from('users').select('id', { count: 'exact' }).eq('account_status', 'pending')
  
  const userStats = [
    { name: 'Active', value: activeUsers?.length || 0 },
    { name: 'Pending', value: pendingUsers?.length || 0 }
  ]

  // 2. Fetch Event Stats (by category)
  const { data: events } = await supabase.from('events').select('event_type')
  const eventCounts = events?.reduce((acc: any, curr) => {
    acc[curr.event_type] = (acc[curr.event_type] || 0) + 1
    return acc
  }, {}) || {}
  
  const eventStats = Object.keys(eventCounts).map(key => ({
    name: key,
    count: eventCounts[key]
  }))

  // 3. Leaderboard Calculation
  // We fetch all time_in logs and calculate points dynamically
  const { data: attendance } = await supabase
    .from('attendance')
    .select('user_id, event_id, type, events(points_awarded)')

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, student_no, program, year_level')
    .eq('account_status', 'active')
    
  // Map points to users
  const userPointsMap = new Map()
  users?.forEach(u => userPointsMap.set(u.id, { ...u, points: 0 }))
  
  // Group by user -> event to check for both time_in and time_out (our new logic!)
  const userEventStatus = new Map()
  
  attendance?.forEach((log: any) => {
    const key = `${log.user_id}_${log.event_id}`
    if (!userEventStatus.has(key)) {
      userEventStatus.set(key, { hasTimeIn: false, hasTimeOut: false, points: log.events?.points_awarded || 0, userId: log.user_id })
    }
    const status = userEventStatus.get(key)
    if (log.type === 'time_in') status.hasTimeIn = true
    if (log.type === 'time_out') status.hasTimeOut = true
  })
  
  // Award points for fully completed events
  Array.from(userEventStatus.values()).forEach(status => {
    if (status.hasTimeIn && status.hasTimeOut) {
      const u = userPointsMap.get(status.userId)
      if (u) {
        u.points += status.points
      }
    }
  })
  
  // Sort leaderboard
  const leaderboard = Array.from(userPointsMap.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Executive overview of portal engagement and statistics.</p>
        </div>

        <AnalyticsClient 
          userStats={userStats} 
          eventStats={eventStats} 
          leaderboard={leaderboard} 
        />
      </div>
    </div>
  )
}
