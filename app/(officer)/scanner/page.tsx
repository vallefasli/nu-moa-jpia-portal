import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { ScannerView } from './ScannerView'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  // 2. Fetch Active Events and Recent Attendance Feed in parallel
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [eventsRes, feedRes] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, status, date, time_start, time_end')
      .or(`status.in.(ongoing,upcoming),date.gte.${todayStr}`)
      .order('date', { ascending: true }),
    supabase
      .from('attendance')
      .select(`
        id,
        event_id,
        timestamp,
        type,
        officer_id,
        users!attendance_user_id_fkey (
          full_name,
          student_no
        ),
        officer:users!attendance_officer_id_fkey (
          full_name,
          student_no
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(50)
  ])

  const activeEvents = eventsRes.data
  const initialFeed = feedRes.data

  if (feedRes.error) {
    console.error("FEED FETCH ERROR:", feedRes.error)
  }

  return (
    <div className="min-h-full pb-20">
      <ScannerView 
        activeEvents={activeEvents || []} 
        initialFeed={initialFeed || []} 
      />
    </div>
  )
}
