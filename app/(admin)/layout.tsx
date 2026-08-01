import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, ScanLine, LogOut, Calendar, ClipboardList, BarChart3, Download } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'
import { AutoLogout } from '@/components/AutoLogout'

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

  return (
    <div className="flex h-[100dvh] bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      <AutoLogout />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-200 z-10 transition-all duration-300">
        <div className="p-8 pb-4">
          <div className="text-gray-900">
            <h2 className="text-2xl font-extrabold tracking-tight">NU MOA JPIA</h2>
          </div>
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-2">
            {role === 'admin' ? 'Admin Portal' : 'Officer Portal'}
          </p>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1.5">
          {role === 'admin' && (
            <Link
              href="/admin/verification"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gray-100">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              Verification Queue
            </Link>
          )}
          
          {(role === 'admin' || role === 'officer') && (
            <Link
              href="/admin/scanner"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gray-100">
                <ScanLine className="w-5 h-5 text-gray-500" />
              </div>
              Event Scanner
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/admin/events"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gray-100">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              Event Management
            </Link>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/attendance"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gray-100">
                <ClipboardList className="w-5 h-5 text-gray-500" />
              </div>
              Attendance Logs
            </Link>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/analytics"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gray-100">
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              Analytics
            </Link>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/reports"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gray-100">
                <Download className="w-5 h-5 text-gray-500" />
              </div>
              Data Export
            </Link>
          )}
        </nav>
        
        {/* Desktop Sidebar Logout */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <form action={logout}>
            <button 
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5" />
              </div>
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative w-full h-full bg-[#f8f9fc]">
        
        {/* Mobile Top Header with Logout */}
        <div className="md:hidden flex items-center justify-between p-4 px-6 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-lg tracking-tight">NU MOA JPIA</h2>
            <div className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
               {role}
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors active:scale-95">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-2 py-2 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {role === 'admin' && (
            <Link
              href="/admin/verification"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[72px] text-gray-400 hover:text-gray-600"
            >
              <div className="p-2 rounded-xl mb-1 bg-transparent">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">
                Queue
              </span>
            </Link>
          )}

          {(role === 'admin' || role === 'officer') && (
            <Link
              href="/admin/scanner"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[72px] text-gray-400 hover:text-gray-600"
            >
              <div className="p-2 rounded-xl mb-1 bg-transparent">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">
                Scanner
              </span>
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/admin/events"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[72px] text-gray-400 hover:text-gray-600"
            >
              <div className="p-2 rounded-xl mb-1 bg-transparent">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">
                Events
              </span>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/attendance"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[72px] text-gray-400 hover:text-gray-600"
            >
              <div className="p-2 rounded-xl mb-1 bg-transparent">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">
                Logs
              </span>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/analytics"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[60px] text-gray-400 hover:text-gray-600"
            >
              <div className="p-2 rounded-xl mb-1 bg-transparent">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">
                Data
              </span>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/reports"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[60px] text-gray-400 hover:text-gray-600"
            >
              <div className="p-2 rounded-xl mb-1 bg-transparent">
                <Download className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">
                Export
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
