import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsClient } from './ReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all users for roster
  const { data: users } = await supabase
    .from('users')
    .select('member_id, student_no, full_name, email, program, year_level, committee, role, account_status')
    .order('full_name', { ascending: true })
    .limit(100000)

  // Fetch all events for the list
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date')
    .order('date', { ascending: false })

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Data Exports</h1>
          <p className="text-gray-500 mt-1">Download official CSV reports for administrative records.</p>
        </div>

        <ReportsClient 
          users={users || []} 
          events={events || []} 
        />
      </div>
    </div>
  )
}
