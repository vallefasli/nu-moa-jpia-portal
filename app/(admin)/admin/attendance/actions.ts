'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAttendanceOverride(eventId: string, studentNo: string, type: 'time_in' | 'time_out') {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized: Only Admins can override attendance' }

  // 1. Find user by student number
  const { data: student, error: findError } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('student_no', studentNo)
    .single()

  if (!student) return { error: 'Student not found with that Student Number' }

  // 2. Insert attendance log directly
  const { error } = await supabase.from('attendance').insert({
    event_id: eventId,
    user_id: student.id,
    officer_id: user.id,
    type: type
  })

  if (error) return { error: error.message }
  
  revalidatePath('/admin/attendance')
  return { success: true, studentName: student.full_name }
}

export async function deleteAttendanceLog(id: string) {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized: Only Admins can delete logs' }

  const { error } = await supabase.from('attendance').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/attendance')
  return { success: true }
}
