import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MemberSidebar } from './MemberNav'

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
    .select('account_status')
    .eq('id', user.id)
    .single()

  if (profile?.account_status !== 'active') {
    redirect('/pending')
  }

  return (
    <div className="flex h-[100dvh] bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      <MemberSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative w-full h-full bg-[#f8f9fc]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
