import { getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ScanLine, LogOut, FileBadge, User } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { AutoLogout } from '@/components/AutoLogout'
import { OfficerNav } from './OfficerNav'

export default async function OfficerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  const role = profile?.role

  if (role !== 'officer' && role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-[100dvh] bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      <AutoLogout />
      <OfficerNav role={role} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative w-full h-full bg-[#f8f9fc]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
