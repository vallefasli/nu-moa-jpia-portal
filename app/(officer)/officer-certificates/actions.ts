'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function distributeCertificates(eventId: string, certificateLink: string) {
  const supabase = await createClient()

  // Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('events')
    .update({ certificate_link: certificateLink })
    .eq('id', eventId)

  if (error) {
    console.error('Error distributing certificates:', error)
    return { success: false, error: 'Failed to update certificate link.' }
  }

  revalidatePath('/officer-certificates')
  revalidatePath('/certificates') // also revalidate member side
  return { success: true }
}

export async function getEventFeedbacks(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('event_feedbacks')
    .select(`
      user_id,
      rating,
      comment,
      additional_responses,
      created_at,
      users!event_feedbacks_user_id_fkey (
        full_name,
        student_no,
        member_id
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedbacks:', error)
    return { success: false, error: 'Failed to fetch feedbacks' }
  }

  return { success: true, data }
}
