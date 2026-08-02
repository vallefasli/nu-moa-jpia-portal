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

export async function removeMember(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function updateMemberProfile(userId: string, data: { full_name: string, program: string, year_level: string, committee: string }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ 
      full_name: data.full_name,
      program: data.program,
      year_level: data.year_level,
      committee: data.committee
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/members')
  return { success: true }
}
