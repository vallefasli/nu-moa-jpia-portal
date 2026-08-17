'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const event_type = formData.get('event_type') as string
  const date = formData.get('date') as string
  const time_start = formData.get('time_start') as string
  const time_end = formData.get('time_end') as string
  const points_awarded = parseInt(formData.get('points_awarded') as string) || 0
  const capacity = parseInt(formData.get('capacity') as string) || null
  const poster_url = formData.get('poster_url') as string | null
  const banner_url = formData.get('banner_url') as string | null
  const themes = JSON.parse((formData.get('themes') as string) || '[]')
  const custom_feedback_questions = JSON.parse((formData.get('custom_feedback_questions') as string) || '[]')

  // Validation
  if (time_start && time_end && time_start >= time_end) {
    return { error: 'End time must be after start time' }
  }

  const { error } = await supabase.from('events').insert({
    title,
    description,
    location,
    event_type,
    date,
    time_start,
    time_end,
    points_awarded,
    capacity,
    poster_url,
    banner_url,
    themes,
    status: 'upcoming',
    custom_feedback_questions
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/events')
  return { success: true }
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const event_type = formData.get('event_type') as string
  const date = formData.get('date') as string
  const time_start = formData.get('time_start') as string
  const time_end = formData.get('time_end') as string
  const points_awarded = parseInt(formData.get('points_awarded') as string) || 0
  const capacity = parseInt(formData.get('capacity') as string) || null
  const poster_url = formData.get('poster_url') as string | null
  const banner_url = formData.get('banner_url') as string | null
  const status = formData.get('status') as string
  const themes = JSON.parse((formData.get('themes') as string) || '[]')
  const custom_feedback_questions = JSON.parse((formData.get('custom_feedback_questions') as string) || '[]')

  // Validation
  if (time_start && time_end && time_start >= time_end) {
    return { error: 'End time must be after start time' }
  }

  const { error } = await supabase.from('events').update({
    title,
    description,
    location,
    event_type,
    date,
    time_start,
    time_end,
    points_awarded,
    capacity,
    poster_url,
    banner_url,
    themes,
    status,
    custom_feedback_questions,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/events')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('events').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/events')
  return { success: true }
}

export async function clearAllEvents() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  // Delete all attendance records, feedbacks, and certificates linked to events
  await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('event_feedbacks').delete().neq('event_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('certificates').delete().neq('event_id', '00000000-0000-0000-0000-000000000000')
  
  const { error } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) return { error: error.message }
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/officer-certificates')
  return { success: true }
}
