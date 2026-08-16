import { createClient } from '@/utils/supabase/server'
import { VerificationClient } from './VerificationClient'

export default async function VerificationQueuePage() {
  const supabase = await createClient()

  // Fetch pending users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, student_no, member_id, program, year_level, committee, email, student_email, created_at, account_status')
    .eq('account_status', 'pending')
    .order('created_at', { ascending: true })

  // Fetch current user's role to determine if they can approve
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  return (
    <VerificationClient users={users || []} isAdmin={isAdmin} />
  )
}
