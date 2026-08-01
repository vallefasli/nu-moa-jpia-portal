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
  // Use the highly optimized PostgreSQL View to get total points directly from the DB
  const { data: userPoints } = await supabase
    .from('user_points_view')
    .select('*')
    .eq('account_status', 'active')
    .order('total_points', { ascending: false })
    
  // Sort leaderboard by points (descending), then by name
  const leaderboard = (userPoints || [])
    .map((u: any) => ({
      id: u.user_id,
      full_name: u.full_name,
      student_no: u.student_no,
      program: u.program,
      year_level: u.year_level,
      points: Number(u.total_points) || 0
    }))
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
