'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ account_status: 'active' })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function rejectUser(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ account_status: 'rejected' })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/verification')
  return { success: true }
}
