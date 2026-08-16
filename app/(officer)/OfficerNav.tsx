'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScanLine, LogOut, FileBadge, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutDialog } from '@/components/LogoutDialog'

export function OfficerNav({ role }: { role?: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Scanner', href: '/scanner', icon: ScanLine },
    { name: 'Certificates', href: '/officer-certificates', icon: FileBadge },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-200 z-10 transition-all duration-300">
        <div className="p-8 pb-4">
          <div className="text-gray-900">
            <h2 className="text-2xl font-extrabold tracking-tight">NU MOA JPIA</h2>
          </div>
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-2">
            Officer Portal
          </p>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group",
                  isActive 
                    ? "bg-blue-50 text-[#35408e] shadow-sm translate-x-1" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-white text-[#35408e] shadow-sm" : "bg-gray-100 group-hover:bg-white"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-[#35408e]" : "text-gray-500")} />
                </div>
                {item.name === 'Scanner' ? 'Event Scanner' : item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Sidebar Bottom Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-2 mt-auto">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors group"
          >
            <div className="p-2 bg-white rounded-lg group-hover:bg-gray-100 transition-colors">
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            Member Portal
          </Link>
          <LogoutDialog>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <div className="p-2 bg-white rounded-lg group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              Log Out
            </button>
          </LogoutDialog>
        </div>
      </aside>

      {/* Mobile Top Header with Logout */}
      <div className="md:hidden flex items-center justify-between p-4 px-6 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900 text-lg tracking-tight">NU MOA JPIA</h2>
          <div className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
            {role}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="text-gray-400 p-2 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors active:scale-95">
            <User className="w-5 h-5" />
          </Link>
          <LogoutDialog>
            <button className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors active:scale-95">
              <LogOut className="w-5 h-5" />
            </button>
          </LogoutDialog>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] z-50 px-2 py-2 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
                  <span className="absolute -top-3 w-8 h-1 bg-[#35408e] rounded-b-full shadow-[0_2px_8px_rgba(53,64,142,0.4)]" />
                )}
                <div className={cn(
                  "p-2 rounded-xl mb-1 transition-all duration-300",
                  isActive ? "bg-blue-50 scale-110 shadow-inner" : "bg-transparent"
                )}>
                  <item.icon className={cn("w-6 h-6 transition-all", isActive ? "text-[#35408e]" : "")} />
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
    </>
  )
}
