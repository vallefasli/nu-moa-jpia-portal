import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { LogoutDialog } from '@/components/LogoutDialog'
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
    .select('id, full_name, student_no, member_id, program, year_level, committee, email, created_at, account_status, role')
    .eq('account_status', 'active')
    .in('role', ['member', 'officer'])
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#35408e]">Manage Members</h1>
          <p className="text-gray-500 mt-1">View and edit active JPIA members by year level.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {users?.length || 0} Active Members
          </Badge>
          <LogoutDialog>
            <Button variant="outline" size="sm">
              Log Out
            </Button>
          </LogoutDialog>
        </div>
      </div>

      <MembersClient initialUsers={users || []} />
    </div>
  )
}
