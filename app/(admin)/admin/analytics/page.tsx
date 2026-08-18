import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()

  // Fetch all analytics datasets in parallel
  const [activeUsersRes, pendingUsersRes, eventsRes, userPointsRes] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('account_status', 'active')
      .neq('full_name', 'System Account')
      .neq('full_name', 'System Admin')
      .neq('role', 'admin'),
    supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('account_status', 'pending')
      .neq('full_name', 'System Account')
      .neq('full_name', 'System Admin'),
    supabase
      .from('events')
      .select('event_type'),
    supabase
      .from('user_points_view')
      .select('*')
      .eq('account_status', 'active')
      .neq('full_name', 'System Account')
      .neq('full_name', 'System Admin')
      .order('total_points', { ascending: false })
  ])

  const activeUsers = activeUsersRes.data
  const pendingUsers = pendingUsersRes.data
  const events = eventsRes.data
  const userPoints = userPointsRes.data

  const userStats = [
    { name: 'Active', value: activeUsers?.length || 0 },
    { name: 'Pending', value: pendingUsers?.length || 0 }
  ]

  const eventCounts = events?.reduce((acc: any, curr) => {
    acc[curr.event_type] = (acc[curr.event_type] || 0) + 1
    return acc
  }, {}) || {}
  
  const eventStats = Object.keys(eventCounts).map(key => ({
    name: key,
    count: eventCounts[key]
  }))
    
  // Sort leaderboard by points (descending), then by name
  const leaderboard = (userPoints || [])
    .filter((u: any) => u.full_name !== 'System Account' && u.full_name !== 'System Admin')
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
