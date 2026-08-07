'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function distributeCertificates(eventId: string, userIds: string[], templateUrl: string) {
  const supabase = await createClient()

  // Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    return { success: false, error: 'Unauthorized' }
  }

  // Insert or update certificates for each selected user
  const upsertData = userIds.map(userId => ({
    event_id: eventId,
    user_id: userId,
    template_url: templateUrl,
    issue_date: new Date().toISOString().split('T')[0]
  }))

  const { error } = await supabase
    .from('certificates')
    .upsert(upsertData, { onConflict: 'event_id,user_id' })

  if (error) {
    console.error('Error distributing certificates:', error)
    return { success: false, error: 'Failed to distribute certificates.' }
  }

  revalidatePath('/officer-certificates')
  return { success: true }
}
