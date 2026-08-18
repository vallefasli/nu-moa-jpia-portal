import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from './ReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()

  // Fetch users roster and events in parallel
  const [usersRes, eventsRes] = await Promise.all([
    supabase
      .from('users')
      .select('id, member_id, student_no, first_name, middle_name, last_name, full_name, email, student_email, program, year_level, committee, role, account_status, created_at')
      .neq('full_name', 'System Account')
      .neq('full_name', 'System Admin')
      .neq('role', 'admin')
      .neq('account_status', 'rejected')
      .order('full_name', { ascending: true })
      .limit(100000),
    supabase
      .from('events')
      .select(`
        id, 
        title, 
        date, 
        time_start, 
        time_end, 
        status, 
        points_awarded,
        event_rsvps (count),
        attendance (count),
        event_feedbacks (count)
      `)
      .order('date', { ascending: false })
  ])

  const users = usersRes.data
  const events = eventsRes.data

  const formattedEvents = (events || []).map(ev => ({
    id: ev.id,
    title: ev.title,
    date: ev.date,
    time_start: ev.time_start,
    time_end: ev.time_end,
    status: ev.status,
    points_awarded: ev.points_awarded,
    rsvpCount: Array.isArray(ev.event_rsvps) && ev.event_rsvps[0]?.count !== undefined 
      ? ev.event_rsvps[0].count 
      : (typeof (ev.event_rsvps as any)?.count === 'number' ? (ev.event_rsvps as any).count : 0),
    attendanceCount: Array.isArray(ev.attendance) && ev.attendance[0]?.count !== undefined 
      ? ev.attendance[0].count 
      : (typeof (ev.attendance as any)?.count === 'number' ? (ev.attendance as any).count : 0),
    feedbackCount: Array.isArray(ev.event_feedbacks) && ev.event_feedbacks[0]?.count !== undefined 
      ? ev.event_feedbacks[0].count 
      : (typeof (ev.event_feedbacks as any)?.count === 'number' ? (ev.event_feedbacks as any).count : 0),
  }))

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <ReportsClient 
        users={users || []} 
        events={formattedEvents} 
      />
    </div>
  )
}
