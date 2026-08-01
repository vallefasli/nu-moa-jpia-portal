'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitFeedback(userId: string, type: string, message: string) {
  const supabase = await createClient()

  // Ensure they are authenticated and match the userId
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabase
    .from('feedback')
    .insert([{ user_id: userId, type, message }])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
