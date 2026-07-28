import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ActionButtons } from './ActionButtons'

import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'

export default async function VerificationQueuePage() {
  const supabase = await createClient()

  // Fetch pending users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, student_no, program, year_level, committee, email, created_at, account_status')
    .eq('account_status', 'pending')
    .order('created_at', { ascending: true })

  // Fetch current user's role to determine if they can approve
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#35408e]">Verification Queue</h1>
          <p className="text-gray-500 mt-1">Manage pending membership applications.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {users?.length || 0} Pending
          </Badge>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Log Out
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Accounts</CardTitle>
          <CardDescription>Review and approve users to grant them access to the portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Student No.</TableHead>
                  <TableHead>Program / Year</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!users || users.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                      No pending accounts to verify.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.student_no}</TableCell>
                      <TableCell>
                        {user.program} - {user.year_level}
                        {user.committee && <div className="text-xs text-gray-500 mt-1">Comm: {user.committee}</div>}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin ? (
                          <ActionButtons userId={user.id} />
                        ) : (
                          <span className="text-gray-400 text-sm italic">Admin only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
