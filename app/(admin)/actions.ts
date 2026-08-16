'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWelcomeEmail, sendRejectionEmail } from '@/lib/email'

export async function approveUser(userId: string) {
  const supabase = await createClient()
  // Fetch user details first to send email
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('users')
    .update({ account_status: 'active' })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  if (user) {
    await sendWelcomeEmail(user.email, user.full_name)
  }

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function rejectUser(userId: string) {
  const supabase = await createClient()
  // Fetch user details first to send email
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('users')
    .update({ account_status: 'rejected' })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  if (user) {
    await sendRejectionEmail(user.email, user.full_name)
  }

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function approveUsers(userIds: string[]) {
  const supabase = await createClient()
  
  // Fetch users first to send emails
  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name')
    .in('id', userIds)

  const { error } = await supabase
    .from('users')
    .update({ account_status: 'active' })
    .in('id', userIds)

  if (error) {
    return { error: error.message }
  }

  if (users) {
    // Send emails in parallel but safely
    await Promise.allSettled(
      users.map(u => sendWelcomeEmail(u.email, u.full_name))
    )
  }

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function rejectUsers(userIds: string[]) {
  const supabase = await createClient()
  
  // Fetch users first to send emails
  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name')
    .in('id', userIds)

  const { error } = await supabase
    .from('users')
    .update({ account_status: 'rejected' })
    .in('id', userIds)

  if (error) {
    return { error: error.message }
  }

  if (users) {
    await Promise.allSettled(
      users.map(u => sendRejectionEmail(u.email, u.full_name))
    )
  }

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function removeMember(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function removeMembers(userIds: string[]) {
  const supabase = await createClient()
  
  const results = await Promise.all(
    userIds.map(id => supabase.rpc('delete_user_by_admin', { target_user_id: id }))
  )

  const errors = results.filter(r => r.error)
  if (errors.length > 0) {
    return { error: `Failed to remove ${errors.length} members. ${errors[0].error?.message}` }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function updateMemberProfile(userId: string, data: { full_name: string, first_name: string, middle_name: string, last_name: string, student_no: string, student_email: string, program: string, year_level: string, committee: string, role: string }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ 
      full_name: data.full_name,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      student_no: data.student_no,
      student_email: data.student_email,
      program: data.program,
      year_level: data.year_level,
      committee: data.committee,
      role: data.role
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  return { success: true }
}
