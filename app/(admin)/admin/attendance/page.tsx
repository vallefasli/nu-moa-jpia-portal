import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceClient } from './AttendanceClient'

export const dynamic = 'force-dynamic'

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const params = await searchParams
  const eventIdParams = params.eventId

  // Fetch all events for the dropdown
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date, status')
    .order('date', { ascending: false })

  const activeEventId = eventIdParams || (events && events.length > 0 ? events[0].id : null)

  let consolidatedRecords: any[] = []

  if (activeEventId) {
    // 1. Fetch RSVPs for active event
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select(`
        user_id,
        users ( id, full_name, student_no, program )
      `)
      .eq('event_id', activeEventId)

    // 2. Fetch Attendance for active event
    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        id, user_id, type, timestamp,
        users!attendance_user_id_fkey ( id, full_name, student_no, program ),
        officer:users!attendance_officer_id_fkey ( full_name )
      `)
      .eq('event_id', activeEventId)
      .order('timestamp', { ascending: true })

    // Consolidate Data
    const participantsMap = new Map<string, any>()

    // Add RSVPs
    rsvps?.forEach((rsvp: any) => {
      const u = rsvp.users
      if (!u) return
      participantsMap.set(u.id, {
        user_id: u.id,
        full_name: u.full_name,
        student_no: u.student_no,
        program: u.program,
        is_registered: true,
        time_in: null,
        time_in_officer: null,
        time_in_id: null,
        time_out: null,
        time_out_officer: null,
        time_out_id: null,
      })
    })

    // Add Attendance
    attendance?.forEach((log: any) => {
      const u = log.users
      if (!u) return

      if (!participantsMap.has(u.id)) {
        participantsMap.set(u.id, {
          user_id: u.id,
          full_name: u.full_name,
          student_no: u.student_no,
          program: u.program,
          is_registered: false,
          time_in: null,
          time_in_officer: null,
          time_in_id: null,
          time_out: null,
          time_out_officer: null,
          time_out_id: null,
        })
      }

      const p = participantsMap.get(u.id)
      const officerName = log.officer?.full_name || 'System Admin'

      if (log.type === 'time_in') {
        if (!p.time_in) {
          p.time_in = log.timestamp
          p.time_in_officer = officerName
          p.time_in_id = log.id
        }
      } else if (log.type === 'time_out') {
        p.time_out = log.timestamp
        p.time_out_officer = officerName
        p.time_out_id = log.id
      }
    })

    consolidatedRecords = Array.from(participantsMap.values())
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Logs</h1>
            <p className="text-gray-500 mt-1">Review holistic event participation, fix mistakes, and force manual overrides.</p>
          </div>
        </div>

        <AttendanceClient 
          events={events || []} 
          activeEventId={activeEventId || ''}
          initialLogs={consolidatedRecords} 
        />
      </div>
    </div>
  )
}
