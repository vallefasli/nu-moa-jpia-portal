import { getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MemberSidebar } from './MemberNav'
import { FeedbackWidget } from './components/FeedbackWidget'
import { AutoLogout } from '@/components/AutoLogout'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)

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
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full bg-[#f8f9fc]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out w-full min-h-full pb-28 md:pb-8">
          {children}
        </div>
        <FeedbackWidget userId={user.id} />
      </main>
    </div>
  )
}
