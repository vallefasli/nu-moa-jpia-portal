import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { VerificationClient } from './VerificationClient'

export default async function VerificationQueuePage() {
  const user = await getAuthenticatedUser()
  const profile = user ? await getCurrentUserProfile(user.id) : null
  const isAdmin = profile?.role === 'admin'

  const supabase = await createClient()

  // Fetch pending users
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, student_no, member_id, program, year_level, committee, email, student_email, created_at, account_status')
    .eq('account_status', 'pending')
    .neq('full_name', 'System Account')
    .neq('full_name', 'System Admin')
    .order('created_at', { ascending: true })

  return (
    <VerificationClient users={users || []} isAdmin={isAdmin} />
  )
}
