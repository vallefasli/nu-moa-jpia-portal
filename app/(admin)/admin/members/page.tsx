import { createClient } from '@/utils/supabase/server'
import MembersClient from './MembersClient'
import { redirect } from 'next/navigation'

export default async function MembersPage() {
  const supabase = await createClient()

  // Fetch current user's role to determine access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }
  
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    redirect('/admin/scanner') // Redirect non-admins away
  }

  // Fetch active users (members and officers, not admins)
  const { data: users, error } = await supabase
    .from('users')
    .select('id, first_name, middle_name, last_name, full_name, student_no, member_id, program, year_level, committee, email, student_email, created_at, account_status, role')
    .eq('account_status', 'active')
    .in('role', ['member', 'officer'])
    .order('created_at', { ascending: false })

  return (
    <MembersClient initialUsers={users || []} />
  )
}
