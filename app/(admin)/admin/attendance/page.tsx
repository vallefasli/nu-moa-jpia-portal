import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceClient } from './AttendanceClient'

export default async function AttendancePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // Fetch all events for the dropdown
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date, status')
    .order('date', { ascending: false })

  // Fetch all attendance logs (we will limit to latest 500 to prevent crash, client can filter)
  const { data: logs } = await supabase
    .from('attendance')
    .select(`
      id, type, timestamp, event_id,
      users ( id, full_name, student_no, program ),
      officer:officer_id ( full_name )
    `)
    .order('timestamp', { ascending: false })
    .limit(500)

  // Map the raw data to a flatter structure
  const formattedLogs = (logs || []).map(log => ({
    id: log.id,
    type: log.type,
    timestamp: log.timestamp,
    event_id: log.event_id,
    user_name: (log.users as any)?.full_name,
    student_no: (log.users as any)?.student_no,
    program: (log.users as any)?.program,
    officer_name: (log as any).officer?.full_name || 'System'
  }))

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Logs</h1>
            <p className="text-gray-500 mt-1">Review records, fix mistakes, and force manual overrides.</p>
          </div>
        </div>

        <AttendanceClient events={events || []} initialLogs={formattedLogs} />
      </div>
    </div>
  )
}
