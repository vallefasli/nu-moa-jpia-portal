'use server'

import { createClient } from '@/utils/supabase/server'

export async function exportConsolidatedAttendance(eventId: string) {
  const supabase = await createClient()

  // 1. Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // 2. Fetch Event Info
  const { data: event } = await supabase
    .from('events')
    .select('id, title, date, points_awarded')
    .eq('id', eventId)
    .single()

  // 3. Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select(`
      user_id,
      users ( id, first_name, middle_name, last_name, full_name, student_no, program, member_id, year_level, committee, email, role )
    `)
    .eq('event_id', eventId)

  // 4. Fetch Attendance
  const { data: attendance } = await supabase
    .from('attendance')
    .select(`
      id, user_id, type, timestamp,
      users!attendance_user_id_fkey ( id, first_name, middle_name, last_name, full_name, student_no, program, member_id, year_level, committee, email, role ),
      officer:users!attendance_officer_id_fkey ( full_name )
    `)
    .eq('event_id', eventId)
    .order('timestamp', { ascending: true })

  const participantsMap = new Map<string, any>()

  // Format Helper
  const formatOfficerName = (fullName?: string) => {
    if (!fullName || fullName === 'System Admin' || fullName === 'System Account') return 'System Admin'
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1][0]}.`
  }

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
      member_id: u.member_id,
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
      time_out: null,
      time_out_officer: null,
    })
  })

  // Add Attendance
  attendance?.forEach((log: any) => {
    const u = log.users
    if (!u || isSystemUser(u)) return

    if (!participantsMap.has(u.id)) {
      participantsMap.set(u.id, {
        user_id: u.id,
        member_id: u.member_id,
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

  return { success: true, records, event }
}

export async function exportEventFeedback(eventId: string) {
  const supabase = await createClient()

  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Fetch event for custom question headers
  const { data: event } = await supabase
    .from('events')
    .select('id, title, custom_feedback_questions')
    .eq('id', eventId)
    .single()

  const { data: feedbacks, error } = await supabase
    .from('event_feedbacks')
    .select(`
      id,
      rating,
      comment,
      additional_responses,
      created_at,
      users!event_feedbacks_user_id_fkey (
        id,
        member_id,
        first_name,
        middle_name,
        last_name,
        student_no,
        full_name,
        program,
        year_level,
        committee,
        email,
        role
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: 'Failed to fetch feedback records' }
  }

  // Filter out System Account
  const validFeedbacks = (feedbacks || []).filter(f => {
    const u: any = Array.isArray(f.users) ? f.users[0] : f.users
    return u?.full_name !== 'System Account' && u?.full_name !== 'System Admin'
  }).map(f => {
    const u: any = Array.isArray(f.users) ? f.users[0] : f.users
    return {
      ...f,
      users: u
    }
  })

  return { 
    success: true, 
    feedbacks: validFeedbacks, 
    customQuestions: event?.custom_feedback_questions || [],
    eventTitle: event?.title || 'Event'
  }
}

export async function exportPointsLeaderboard() {
  const supabase = await createClient()

  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // 1. Fetch points view
  const { data: records, error } = await supabase
    .from('user_points_view')
    .select('*')
    .eq('account_status', 'active')
    .neq('full_name', 'System Account')
    .neq('full_name', 'System Admin')
    .order('total_points', { ascending: false })

  if (error) {
    return { error: 'Failed to fetch points leaderboard' }
  }

  // 2. Fetch user detailed names (first_name, middle_name, last_name, member_id, committee)
  const { data: userProfiles } = await supabase
    .from('users')
    .select('id, member_id, first_name, middle_name, last_name, committee, role')
    .eq('account_status', 'active')
    .neq('full_name', 'System Account')
    .neq('full_name', 'System Admin')

  const userMap = new Map<string, any>()
  userProfiles?.forEach(u => userMap.set(u.id, u))

  const mergedRecords = (records || [])
    .filter(r => r.full_name !== 'System Account' && r.full_name !== 'System Admin')
    .map(r => {
      const u = userMap.get(r.user_id) || {}
      return {
        ...r,
        member_id: u.member_id || r.member_id || '',
        first_name: u.first_name || '',
        middle_name: u.middle_name || '',
        last_name: u.last_name || '',
        committee: u.committee || 'None'
      }
    })

  return { success: true, records: mergedRecords }
}


