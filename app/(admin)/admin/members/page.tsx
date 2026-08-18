import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import MembersClient from './MembersClient'
import { redirect } from 'next/navigation'

export default async function MembersPage() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect('/')
  }
  
  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin') {
    redirect('/admin/scanner') // Redirect non-admins away
  }

  const supabase = await createClient()

  // Fetch active users (members and officers, not admins)
  const { data: users, error } = await supabase
    .from('users')
    .select('id, first_name, middle_name, last_name, full_name, student_no, member_id, program, year_level, committee, email, student_email, created_at, account_status, role, qr_token')
    .eq('account_status', 'active')
    .in('role', ['member', 'officer'])
    .neq('full_name', 'System Account')
    .neq('full_name', 'System Admin')
    .order('full_name', { ascending: true })

  return (
    <MembersClient initialUsers={users || []} />
  )
}
