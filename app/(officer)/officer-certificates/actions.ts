'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function saveCertificateDistribution(
  eventId: string,
  selectedUserIds: string[],
  isAutoEnabled: boolean,
  certificateLink: string | null
) {
  const supabase = await createClient()

  // Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized' }
  }

  // Fetch ONLY selected feedbacks for this event
  const { data: feedbacks } = await supabase
    .from('event_feedbacks')
    .select('user_id, additional_responses')
    .eq('event_id', eventId)
    .in('user_id', selectedUserIds)

  if (feedbacks) {
    const serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // We update only the selected members' feedbacks
    for (const f of feedbacks) {
      const newResponses = { ...(f.additional_responses || {}) }
      
      if (isAutoEnabled) newResponses.auto_certificate = true
      else delete newResponses.auto_certificate
      
      if (certificateLink) newResponses.certificate_link = certificateLink
      else delete newResponses.certificate_link

      await serviceClient
        .from('event_feedbacks')
        .update({ additional_responses: newResponses })
        .eq('event_id', eventId)
        .eq('user_id', f.user_id)
    }

    // Save link to events table for officer UI convenience (if there is one)
    if (certificateLink) {
      await supabase.from('events').update({ certificate_link: certificateLink }).eq('id', eventId)
    }
  }

  revalidatePath('/officer-certificates')
  revalidatePath('/certificates') // also revalidate member side
  return { success: true }
}

export async function revokeCertificates(eventId: string, selectedUserIds: string[]) {
  if (selectedUserIds.length === 0) return { success: true }
  
  const supabase = await createClient()

  // Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: feedbacks } = await supabase
    .from('event_feedbacks')
    .select('user_id, additional_responses')
    .eq('event_id', eventId)
    .in('user_id', selectedUserIds)

  if (feedbacks) {
    const serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    for (const f of feedbacks) {
      const newResponses = { ...(f.additional_responses || {}) }
      delete newResponses.auto_certificate
      delete newResponses.certificate_link

      await serviceClient
        .from('event_feedbacks')
        .update({ additional_responses: newResponses })
        .eq('event_id', eventId)
        .eq('user_id', f.user_id)
    }
  }

  revalidatePath('/officer-certificates')
  revalidatePath('/certificates')
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
