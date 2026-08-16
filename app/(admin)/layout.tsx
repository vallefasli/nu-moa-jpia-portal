import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, LogOut, Calendar, ClipboardList, BarChart3, Download, UserCog, ScanLine, FileBadge } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'
import { AutoLogout } from '@/components/AutoLogout'
import { AdminNav } from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  if (role !== 'admin') {
    if (role === 'officer') {
      redirect('/scanner')
    } else {
      redirect('/dashboard')
    }
  }
  return (
    <div className="flex h-[100dvh] bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      <AutoLogout />
      <AdminNav role={role} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative w-full h-full bg-[#f8f9fc]">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
