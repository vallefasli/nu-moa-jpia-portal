'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processScan(qrToken: string, eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Execute the RPC to record attendance safely
  const { data, error } = await supabase.rpc('process_optimistic_scan', {
    p_event_id: eventId,
    p_qr_token: qrToken,
    p_officer_id: user.id
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // The RPC returns a jsonb object
  const result = data as { success: boolean, error?: string, user_id?: string, type?: string }

  if (!result.success) {
    return { success: false, error: result.error || 'Scan failed' }
  }

  // If time_in, award points!
  if (result.type === 'time_in' && result.user_id) {
    const { data: eventData } = await supabase
      .from('events')
      .select('points_awarded')
      .eq('id', eventId)
      .single()

    if (eventData) {
      // Get current points
      const { data: userData } = await supabase
        .from('users')
        .select('points')
        .eq('id', result.user_id)
        .single()
        
      if (userData) {
        await supabase
          .from('users')
          .update({ points: (userData.points || 0) + (eventData.points_awarded || 0) })
          .eq('id', result.user_id)
      }
    }
  }

  // Fetch student details for the overlay
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, student_no')
    .eq('id', result.user_id)
    .single()

  revalidatePath('/admin/scanner')

  return {
    success: true,
    type: result.type,
    student: profile
  }
}

export async function manualCheckIn(query: string, eventId: string) {
  const supabase = await createClient()

  // 1. Try finding by student number first
  let { data: user, error: findError } = await supabase
    .from('users')
    .select('qr_token')
    .eq('student_no', query)
    .single()

  // 2. If not found by student_no, try finding by the unique ID prefix (first 8 chars of UUID)
  if (!user) {
    const { data: allUsers } = await supabase
      .from('users')
      .select('qr_token')
      
    if (allUsers) {
      user = allUsers.find(u => u.qr_token.startsWith(query.toLowerCase())) || null
    }
  }

  if (!user) {
    return { success: false, error: 'Student or Unique ID not found' }
  }

  // Reuse the QR scanner logic!
  return await processScan(user.qr_token, eventId)
}

export async function searchMembers(query: string) {
  if (!query || query.length < 2) return []
  
  const supabase = await createClient()
  
  let { data } = await supabase
    .from('users')
    .select('id, full_name, student_no, qr_token')
    .eq('account_status', 'active')
    .or(`student_no.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(5)

  if (!data || data.length === 0) {
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, full_name, student_no, qr_token')
      .eq('account_status', 'active')
      
    if (allUsers) {
      data = allUsers.filter(u => u.qr_token.startsWith(query.toLowerCase())).slice(0, 5)
    }
  }
    
  return data || []
}
