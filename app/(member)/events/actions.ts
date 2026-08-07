'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitEventFeedback(eventId: string, rating: number, comment: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('event_feedbacks')
    .insert({
      event_id: eventId,
      user_id: user.id,
      rating,
      comment
    })

  if (error) {
    console.error('Error submitting feedback:', error)
    // If it's a unique constraint violation, they already submitted
    if (error.code === '23505') {
      return { success: false, error: 'You have already submitted feedback for this event.' }
    }
    return { success: false, error: 'Failed to submit feedback. Please try again.' }
  }

  revalidatePath('/events')
  revalidatePath('/officer-certificates')
  return { success: true }
}
