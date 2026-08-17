'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { sendWelcomeEmail, sendRejectionEmail } from '@/lib/email'

const getAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (serviceKey) {
    return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
  }
  return null;
}

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

  const adminClient = getAdminClient()
  if (adminClient) {
    await adminClient.auth.admin.deleteUser(userId)
    await adminClient.from('users').delete().eq('id', userId)
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
    
    const adminClient = getAdminClient()
    if (adminClient) {
      await Promise.allSettled(userIds.map(id => adminClient.auth.admin.deleteUser(id)))
      await adminClient.from('users').delete().in('id', userIds)
    }
  }

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function removeMember(userId: string) {
  const adminClient = getAdminClient()

  if (!adminClient) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is missing in your .env.local file. This key is required to completely delete users from the database.' }
  }

  const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  // We should also delete from the users table just in case ON DELETE CASCADE is missing
  await adminClient.from('users').delete().eq('id', userId)

  revalidatePath('/admin/members')
  return { success: true }
}

export async function removeMembers(userIds: string[]) {
  const adminClient = getAdminClient()
  
  if (!adminClient) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is missing in your .env.local file. This key is required to completely delete users from the database.' }
  }

  const results = await Promise.all(userIds.map(id => adminClient.auth.admin.deleteUser(id)))
  const errors = results.filter(r => r.error)
  if (errors.length > 0) return { error: `Failed to remove ${errors.length} members. ${errors[0].error?.message}` }

  // Fallback cleanup
  await adminClient.from('users').delete().in('id', userIds)

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
