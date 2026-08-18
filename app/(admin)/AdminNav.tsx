'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, LogOut, Calendar, ClipboardList, BarChart3, Download, 
  UserCog, ScanLine, MoreHorizontal, X, ArrowRight, User, ShieldCheck, ChevronRight,
  MessageSquareText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutDialog } from '@/components/LogoutDialog'

export function AdminNav({ role }: { role?: string }) {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Full Navigation items (for Desktop Sidebar & Mobile Drawer)
  const allNavItems = [
    { 
      name: 'Verification Queue', 
      shortName: 'Queue', 
      href: '/admin/verification', 
      icon: Users, 
      desc: 'Verify pending membership applications',
      primary: true 
    },
    { 
      name: 'Manage Members', 
      shortName: 'Members', 
      href: '/admin/members', 
      icon: UserCog, 
      desc: 'View & manage active member directory',
      primary: true 
    },
    { 
      name: 'Event Management', 
      shortName: 'Events', 
      href: '/admin/events', 
      icon: Calendar, 
      desc: 'Create and organize organization events',
      primary: true 
    },
    { 
      name: 'Attendance Logs', 
      shortName: 'Logs', 
      href: '/admin/attendance', 
      icon: ClipboardList, 
      desc: 'Review participation and manual overrides',
      primary: true 
    },
    { 
      name: 'Support & Feedback', 
      shortName: 'Feedback', 
      href: '/admin/feedback', 
      icon: MessageSquareText, 
      desc: 'Member inquiries, updates & bugs',
      primary: false 
    },
    { 
      name: 'Event Scanner', 
      shortName: 'Scanner', 
      href: '/admin/scanner', 
      icon: ScanLine, 
      desc: 'Live QR scanner for event attendance',
      primary: false 
    },
    { 
      name: 'Analytics', 
      shortName: 'Data', 
      href: '/admin/analytics', 
      icon: BarChart3, 
      desc: 'View metrics, charts, and leaderboard',
      primary: false 
    },
    { 
      name: 'Data Export', 
      shortName: 'Export', 
      href: '/admin/reports', 
      icon: Download, 
      desc: 'Export member rosters and survey CSVs',
      primary: false 
    },
  ]

  // Primary 4 items for mobile bottom bar
  const mobilePrimaryItems = allNavItems.filter(item => item.primary)
  
  // Is the current active route one of the secondary items in the "More" menu?
  const isSecondaryActive = allNavItems
    .filter(item => !item.primary)
    .some(item => pathname === item.href || pathname.startsWith(item.href + '/'))

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
            Admin Portal
          </p>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1.5 overflow-y-auto">
          {allNavItems.map((item) => {
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
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Desktop Sidebar Bottom Actions */}
        <div className="p-6 border-t border-gray-100/80 bg-gray-50/50 mt-auto">
          <LogoutDialog>
            <button 
              className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              Sign Out
            </button>
          </LogoutDialog>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white/90 backdrop-blur-xl border-b border-gray-200/70 sticky top-0 z-40 shadow-xs pt-safe">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="font-black text-[#35408e] text-base tracking-tight">NU MOA</span>
            <span className="font-black text-gray-900 text-base tracking-tight">JPIA</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#fbb03b]" />
          <span className="text-[10px] bg-[#35408e]/10 text-[#35408e] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1.5">
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

      {/* Mobile Bottom Navigation - 4 Primary Tabs + More */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mobilePrimaryItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ease-out active:scale-95",
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
                  {item.shortName}
                </span>
              </Link>
            )
          })}

          {/* More Menu Trigger Tab */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ease-out active:scale-95",
              isSecondaryActive ? "text-[#35408e]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {isSecondaryActive && (
              <span className="absolute -top-1.5 w-8 h-1 bg-[#35408e] rounded-full shadow-[0_2px_8px_rgba(53,64,142,0.4)]" />
            )}
            <div className={cn(
              "p-1.5 rounded-xl mb-0.5 transition-all duration-200",
              isSecondaryActive ? "bg-blue-50/90 scale-105 shadow-inner" : "bg-transparent"
            )}>
              <MoreHorizontal className={cn("w-5 h-5 transition-all", isSecondaryActive ? "text-[#35408e] stroke-[2.25]" : "text-gray-400")} />
            </div>
            <span className={cn(
              "text-[10px] font-bold tracking-tight transition-colors text-center truncate max-w-full",
              isSecondaryActive ? "text-[#35408e]" : "text-gray-400 font-medium"
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-up "More" Admin Drawer Sheet */}
      {isMoreOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4"
          onClick={() => setIsMoreOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-gray-100 flex flex-col max-h-[85vh] pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-white to-amber-50/30">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#35408e]" />
                  Admin Tools & Navigation
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Quick access to all management features</p>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Links Grid */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1 pb-1">
                All Modules
              </div>

              {allNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    prefetch={true}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group border",
                      isActive 
                        ? "bg-[#35408e] text-white border-[#35408e] shadow-md shadow-blue-900/20" 
                        : "bg-gray-50/60 hover:bg-gray-100 text-gray-800 border-gray-100/80 active:scale-[0.99]"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn(
                        "p-2.5 rounded-xl transition-colors shrink-0",
                        isActive ? "bg-white/15 text-white" : "bg-white text-[#35408e] shadow-xs"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-tight truncate">{item.name}</div>
                        <div className={cn(
                          "text-[11px] truncate mt-0.5",
                          isActive ? "text-blue-100" : "text-gray-500"
                        )}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                      isActive ? "text-white" : "text-gray-400"
                    )} />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
