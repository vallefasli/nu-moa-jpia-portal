'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, QrCode, User, LogOut, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(auth)/actions'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'My QR', href: '/id', icon: QrCode },
    { name: 'Certificates', href: '/certificates', icon: Award },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="flex h-[100dvh] bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300">
        <div className="p-8 pb-4">
          <div className="bg-gradient-to-r from-[#35408e] to-[#2a3370] bg-clip-text text-transparent">
            <h2 className="text-3xl font-extrabold tracking-tight">NU MOA</h2>
            <h2 className="text-3xl font-extrabold tracking-tight mt-[-4px]">JPIA</h2>
          </div>
          <p className="text-[10px] text-[#fbb03b] font-bold tracking-[0.2em] uppercase mt-2">Member Portal</p>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group",
                  isActive 
                    ? "bg-gradient-to-r from-[#35408e] to-[#2a3370] text-white shadow-md shadow-blue-900/20 translate-x-1" 
                    : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 hover:translate-x-1"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-white/10" : "bg-gray-100 group-hover:bg-white"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-500")} />
                </div>
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Desktop Sidebar Logout */}
        <div className="p-6 border-t border-gray-100/80 bg-gray-50/50">
          <form action={logout}>
            <button 
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative w-full h-full bg-[#f8f9fc]">
        
        {/* Mobile Top Header with Logout */}
        <div className="md:hidden flex items-center justify-between p-4 px-6 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#35408e] text-lg tracking-tight">NU MOA JPIA</h2>
            <div className="w-2 h-2 rounded-full bg-[#fbb03b]" />
          </div>
          <form action={logout}>
            <button type="submit" className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors active:scale-95">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Glassmorphism */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] z-50 px-2 py-2 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[72px] transition-all duration-300 ease-out active:scale-90",
                  isActive ? "text-[#35408e]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {isActive && (
                  <span className="absolute -top-3 w-12 h-1 bg-[#35408e] rounded-b-full shadow-[0_2px_8px_rgba(53,64,142,0.4)]" />
                )}
                <div className={cn(
                  "p-2 rounded-xl mb-1 transition-all duration-300",
                  isActive ? "bg-blue-50 scale-110 shadow-inner" : "bg-transparent"
                )}>
                  <item.icon className={cn("w-6 h-6 transition-all", isActive ? "text-[#35408e] fill-[#35408e]/20" : "")} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-wide transition-colors",
                  isActive ? "text-[#35408e]" : "text-gray-400 font-medium"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
