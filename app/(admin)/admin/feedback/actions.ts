'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const getAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
  }
  return null
}

export async function updateFeedbackStatus(id: string, status: 'open' | 'resolved') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { error: 'Unauthorized' }
  }

  const adminClient = getAdminClient() || supabase
  const { error } = await adminClient
    .from('feedback')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/feedback')
  return { success: true }
}

export async function deleteFeedback(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { error: 'Unauthorized' }
  }

  const adminClient = getAdminClient() || supabase
  const { error } = await adminClient
    .from('feedback')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/feedback')
  return { success: true }
}
