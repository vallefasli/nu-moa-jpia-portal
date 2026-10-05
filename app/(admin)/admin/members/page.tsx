import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import MembersClient from './MembersClient'
import { redirect } from 'next/navigation'

import { Suspense } from 'react'

export default async function MembersPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect('/')
  }
  
  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin') {
    redirect('/admin/scanner') // Redirect non-admins away
  }

  const sp = searchParams ? await searchParams : {}
  const targetMemberId = typeof sp.editMember === 'string' ? sp.editMember : undefined
  const targetStudentNo = typeof sp.studentNo === 'string' ? sp.studentNo : (typeof sp.search === 'string' ? sp.search : undefined)

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
    <Suspense fallback={null}>
      <MembersClient 
        initialUsers={users || []} 
        targetMemberId={targetMemberId}
        targetStudentNo={targetStudentNo}
      />
    </Suspense>
  )
}
