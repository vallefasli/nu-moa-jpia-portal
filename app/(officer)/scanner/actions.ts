'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type ScanResult = 
  | { success: true; type?: string; student: { full_name?: string; student_no?: string } }
  | { success: false; error: string }

export async function processScan(qrToken: string, eventId: string): Promise<ScanResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // STRICT SECURITY ENFORCEMENT
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized: Only officers and admins can scan QR codes' }
  }

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
  const result = data as { success: boolean, error?: string, user_id?: string, type?: string, student_name?: string, student_no?: string }

  if (!result.success) {
    return { success: false, error: result.error || 'Scan failed' }
  }

  revalidatePath('/admin/scanner')

  return {
    success: true,
    type: result.type,
    student: {
      full_name: result.student_name,
      student_no: result.student_no
    }
  }
}

export async function manualCheckIn(query: string, eventId: string): Promise<ScanResult> {
  const supabase = await createClient()

  // STRICT SECURITY ENFORCEMENT
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', currentUser.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized: Only officers and admins can manually check-in' }
  }

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

  // STRICT SECURITY ENFORCEMENT
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') return []
  
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

export async function deleteOfficerAttendance(id: string) {
  const supabase = await createClient()

  // STRICT SECURITY ENFORCEMENT
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized: Only officers and admins can delete scans' }
  }

  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/scanner')
  return { success: true }
}
