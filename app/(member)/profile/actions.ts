'use server'

import { createClient } from '@/utils/supabase/server'

export async function requestProfileUpdate(field: string, requestedValue: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const formattedMessage = `[Profile Update Request]\n• Field: ${field}\n• Requested Value: ${requestedValue}\n• Reason: ${reason || 'N/A'}`

  const { error } = await supabase
    .from('feedback')
    .insert([
      {
        user_id: user.id,
        type: 'profile_update',
        message: formattedMessage,
        status: 'open'
      }
    ])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
