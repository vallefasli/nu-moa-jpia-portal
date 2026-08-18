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
      <aside className="hidden md:flex w-72 flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300">
        <div className="p-8 pb-4">
          <div className="bg-gradient-to-r from-[#35408e] to-[#2a3370] bg-clip-text text-transparent">
            <h2 className="text-3xl font-extrabold tracking-tight">NU MOA</h2>
            <h2 className="text-3xl font-extrabold tracking-tight mt-[-4px]">JPIA</h2>
          </div>
          <p className="text-[10px] text-[#fbb03b] font-bold tracking-[0.2em] uppercase mt-2">
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
                prefetch={true}
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
                {item.name === 'Scanner' ? 'Event Scanner' : item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Sidebar Bottom Actions */}
        <div className="p-6 border-t border-gray-100/80 bg-gray-50/50 space-y-2 mt-auto">
          <Link
            href="/dashboard"
            prefetch={true}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-[#35408e]/10 hover:text-[#35408e] transition-all duration-200 group"
          >
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#35408e]/20 transition-colors">
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            Member Portal
          </Link>
          <LogoutDialog>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              Sign Out
            </button>
          </LogoutDialog>
        </div>
      </aside>

      {/* Mobile Top Header with Logout */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white/90 backdrop-blur-xl border-b border-gray-200/70 sticky top-0 z-40 shadow-xs pt-safe">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="font-black text-[#35408e] text-base tracking-tight">NU MOA</span>
            <span className="font-black text-gray-900 text-base tracking-tight">JPIA</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#fbb03b]" />
          <span className="text-[10px] bg-[#35408e]/10 text-[#35408e] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Officer
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Link 
            href="/dashboard" 
            prefetch={true} 
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50/80 hover:bg-blue-100 text-[#35408e] border border-blue-200/60 shadow-2xs transition-all active:scale-95"
            title="Member Portal"
            aria-label="Member Portal"
          >
            <User className="w-4 h-4" />
          </Link>
          <LogoutDialog>
            <button 
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200/60 shadow-2xs transition-all active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </LogoutDialog>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around max-w-xs mx-auto gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ease-out active:scale-95",
                  isActive ? "text-[#35408e]" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-8 h-1 bg-[#35408e] rounded-full shadow-[0_2px_8px_rgba(53,64,142,0.4)]" />
                )}
                <div className={cn(
                  "p-1.5 rounded-xl mb-0.5 transition-all duration-200",
                  isActive ? "bg-blue-50/90 scale-105 shadow-inner" : "bg-transparent"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-all", isActive ? "text-[#35408e] stroke-[2.25]" : "text-gray-400")} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors text-center truncate max-w-full",
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
