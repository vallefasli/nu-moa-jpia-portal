'use server'

import { createClient } from '@/utils/supabase/server'

export async function exportConsolidatedAttendance(eventId: string) {
  const supabase = await createClient()

  // 1. Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // 2. Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select(`
      user_id,
      users ( id, first_name, middle_name, last_name, full_name, student_no, program, member_id )
    `)
    .eq('event_id', eventId)

  // 3. Fetch Attendance
  const { data: attendance } = await supabase
    .from('attendance')
    .select(`
      id, user_id, type, timestamp,
      users!attendance_user_id_fkey ( id, first_name, middle_name, last_name, full_name, student_no, program, member_id ),
      officer:users!attendance_officer_id_fkey ( full_name )
    `)
    .eq('event_id', eventId)
    .order('timestamp', { ascending: true })

  const participantsMap = new Map<string, any>()

  // Format Helper
  const formatOfficerName = (fullName?: string) => {
    if (!fullName || fullName === 'System Admin') return 'System Admin'
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1][0]}.`
  }

  // Add RSVPs
  rsvps?.forEach((rsvp: any) => {
    const u = rsvp.users
    if (!u) return
    participantsMap.set(u.id, {
      user_id: u.id,
      member_id: u.member_id,
      first_name: u.first_name,
      middle_name: u.middle_name,
      last_name: u.last_name,
      full_name: u.full_name,
      student_no: u.student_no,
      program: u.program,
      is_registered: true,
      time_in: null,
      time_in_officer: null,
      time_out: null,
      time_out_officer: null,
    })
  })

  // Add Attendance
  attendance?.forEach((log: any) => {
    const u = log.users
    if (!u) return

    if (!participantsMap.has(u.id)) {
      participantsMap.set(u.id, {
        user_id: u.id,
        member_id: u.member_id,
        first_name: u.first_name,
        middle_name: u.middle_name,
        last_name: u.last_name,
        full_name: u.full_name,
        student_no: u.student_no,
        program: u.program,
        is_registered: false,
        time_in: null,
        time_in_officer: null,
        time_out: null,
        time_out_officer: null,
      })
    }

    const p = participantsMap.get(u.id)
    const officerName = formatOfficerName(log.officer?.full_name)

    if (log.type === 'time_in') {
      if (!p.time_in) {
        p.time_in = log.timestamp
        p.time_in_officer = officerName
      }
    } else if (log.type === 'time_out') {
      p.time_out = log.timestamp
      p.time_out_officer = officerName
    }
  })

  // Sort alphabetically
  const records = Array.from(participantsMap.values()).sort((a, b) => {
    return (a.full_name || '').localeCompare(b.full_name || '')
  })

  return { success: true, records }
}
