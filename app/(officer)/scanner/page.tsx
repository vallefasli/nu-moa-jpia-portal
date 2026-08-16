import { createClient } from '@/utils/supabase/server'
import { ScannerView } from './ScannerView'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  const supabase = await createClient()

  // 1. Authenticate & Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    redirect('/dashboard')
  }

  // 2. Fetch Active Events (ongoing or upcoming, or happening today/future)
  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const { data: activeEvents } = await supabase
    .from('events')
    .select('id, title, status, date, time_start, time_end')
    .or(`status.in.(ongoing,upcoming),date.gte.${todayStr}`)
    .order('date', { ascending: true })

  // 3. Fetch Recent Attendance Feed (last 50 scans)
  const { data: initialFeed, error: feedError } = await supabase
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

  if (feedError) {
    console.error("FEED FETCH ERROR:", feedError)
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
