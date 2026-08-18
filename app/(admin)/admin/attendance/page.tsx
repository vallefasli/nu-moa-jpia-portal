import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceClient } from './AttendanceClient'

export const dynamic = 'force-dynamic'

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin') redirect('/')

  const supabase = await createClient()

  const params = await searchParams
  const eventIdParams = params.eventId

  // Fetch all events with full details for the selector
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date, time_start, time_end, status, points_awarded, poster_url')
    .order('date', { ascending: false })

  const activeEvent = (events || []).find(e => e.id === eventIdParams) || (events && events.length > 0 ? events[0] : null)
  const activeEventId = activeEvent?.id || null

  let consolidatedRecords: any[] = []

  if (activeEventId) {
    // 1. Fetch RSVPs and Attendance in parallel for active event
    const [rsvpsRes, attendanceRes] = await Promise.all([
      supabase
        .from('event_rsvps')
        .select(`
          user_id,
          users ( id, first_name, middle_name, last_name, full_name, student_no, member_id, program, year_level, committee, email )
        `)
        .eq('event_id', activeEventId),
      supabase
        .from('attendance')
        .select(`
          id, user_id, type, timestamp,
          users!attendance_user_id_fkey ( id, first_name, middle_name, last_name, full_name, student_no, member_id, program, year_level, committee, email ),
          officer:users!attendance_officer_id_fkey ( full_name )
        `)
        .eq('event_id', activeEventId)
        .order('timestamp', { ascending: true })
    ])

    const rsvps = rsvpsRes.data
    const attendance = attendanceRes.data

    // Consolidate Data
    const participantsMap = new Map<string, any>()

    const isSystemUser = (u: any) => {
      if (!u) return true
      if (u.full_name === 'System Account' || u.full_name === 'System Admin') return true
      return false
    }

    // Add RSVPs
    rsvps?.forEach((rsvp: any) => {
      const u = rsvp.users
      if (!u || isSystemUser(u)) return
      participantsMap.set(u.id, {
        user_id: u.id,
        member_id: u.member_id || '',
        first_name: u.first_name || '',
        middle_name: u.middle_name || '',
        last_name: u.last_name || '',
        full_name: u.full_name || '',
        student_no: u.student_no || '',
        program: u.program || '',
        year_level: u.year_level || '',
        committee: u.committee || 'None',
        email: u.email || '',
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
      if (!u || isSystemUser(u)) return

      if (!participantsMap.has(u.id)) {
        participantsMap.set(u.id, {
          user_id: u.id,
          member_id: u.member_id || '',
          first_name: u.first_name || '',
          middle_name: u.middle_name || '',
          last_name: u.last_name || '',
          full_name: u.full_name || '',
          student_no: u.student_no || '',
          program: u.program || '',
          year_level: u.year_level || '',
          committee: u.committee || 'None',
          email: u.email || '',
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

    consolidatedRecords = Array.from(participantsMap.values()).sort((a, b) => 
      (a.full_name || '').localeCompare(b.full_name || '')
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">Attendance Logs</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Review holistic event participation, fix mistakes, and force manual overrides.</p>
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
