import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MemberSidebar } from './MemberNav'
import { FeedbackWidget } from './components/FeedbackWidget'
import { AutoLogout } from '@/components/AutoLogout'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('account_status, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin/verification')
  }

  if (profile?.account_status !== 'active') {
    redirect('/pending')
  }

  return (
    <div className="flex h-[100dvh] bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      <AutoLogout />
      <MemberSidebar role={profile?.role} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative w-full h-full bg-[#f8f9fc]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
          {children}
        </div>
        <FeedbackWidget userId={user.id} />
      </main>
    </div>
  )
}
