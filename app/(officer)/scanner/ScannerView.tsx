'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QrScanner } from '@/components/scanner/QrScanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, CalendarDays, Activity, User, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { manualCheckIn, searchMembers, deleteOfficerAttendance } from './actions'
import { createClient } from '@/utils/supabase/client'

export function ScannerView({ activeEvents, initialFeed }: { activeEvents: any[], initialFeed: any[] }) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [manualQuery, setManualQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // Real-time subscription for live feed updates
  useEffect(() => {
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'attendance',
        },
        () => {
          // Whenever a change happens in the database, refresh the current route
          // to fetch the latest initialFeed from the server.
          startTransition(() => {
            router.refresh()
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  useEffect(() => {
    const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
    const now = new Date()
    
    // 1. Explicitly ongoing event
    let currentEvent = activeEvents.find(ev => ev.status === 'ongoing')
    
    // 2. Event happening RIGHT NOW or within 1 hour
    if (!currentEvent) {
      // Sort events by start time so we evaluate earliest first
      const sortedEvents = [...activeEvents].sort((a, b) => {
         const aStart = new Date(`${a.date}T${a.time_start?.slice(0, 8)}+08:00`).getTime()
         const bStart = new Date(`${b.date}T${b.time_start?.slice(0, 8)}+08:00`).getTime()
         return aStart - bStart
      })

      currentEvent = sortedEvents.find(ev => {
        if (ev.status === 'completed') return false
        if (!ev.time_start || !ev.time_end) return false
        
        const start = new Date(`${ev.date}T${ev.time_start.slice(0, 8)}+08:00`)
        const end = new Date(`${ev.date}T${ev.time_end.slice(0, 8)}+08:00`)
        
        const oneHourBeforeStart = new Date(start.getTime() - 60 * 60 * 1000)
        
        // Not passed and within 1 hour before start
        return now <= end && now >= oneHourBeforeStart
      })
    }
    
    if (currentEvent) {
      setSelectedEvent(currentEvent.id)
    } else {
      setSelectedEvent('')
    }
  }, [activeEvents])

  // Save event changes to local storage
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEvent = e.target.value
    setSelectedEvent(newEvent)
    localStorage.setItem('lastActiveEvent', newEvent)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (manualQuery.length >= 2) {
        setIsSearching(true)
        const results = await searchMembers(manualQuery)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [manualQuery])

  const handleScanComplete = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleManualSubmit = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault()
    if (!selectedEvent) return toast.error("Please select an event first")
    
    const queryToUse = directQuery || manualQuery
    if (!queryToUse) return

    setSearchResults([]) // Hide dropdown immediately
    
    const res = await manualCheckIn(queryToUse, selectedEvent)
    if (res.success) {
      toast.success(`Success: ${res.student?.full_name} (${res.type === 'time_in' ? 'TIME IN' : 'TIME OUT'})`)
      setManualQuery('')
      handleScanComplete()
    } else {
      toast.error(res.error)
    }
  }

  const handleDeleteScan = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}'s attendance record?`)) {
      startTransition(async () => {
        const res = await deleteOfficerAttendance(id)
        if (res.success) {
          toast.success("Attendance record removed")
          handleScanComplete()
        } else {
          toast.error(res.error)
        }
      })
    }
  }

  const filteredFeed = initialFeed.filter((entry: any) => entry.event_id === selectedEvent)
  
  const headcount = filteredFeed.reduce((acc: number, entry: any) => {
    return entry.type === 'time_in' ? acc + 1 : acc - 1
  }, 0)

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Scanner</h1>
        <p className="text-gray-500 mt-1">Record member attendance for ongoing and upcoming events.</p>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-8">
      {/* Scanner & Controls (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        
        {selectedEvent ? (
          <>
            {/* Event Selector */}
            <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-2.5 bg-[#fbb03b]/15 rounded-xl text-[#fbb03b]">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="flex-1 text-base sm:text-lg font-bold text-gray-900 truncate">
                  {activeEvents.find(ev => ev.id === selectedEvent)?.title || "No active event"}
                </div>
              </CardContent>
            </Card>

            {/* The Camera Scanner */}
            <QrScanner eventId={selectedEvent} onScanComplete={handleScanComplete} />

            {/* Manual Fallback with Autocomplete */}
            <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white overflow-visible">
              <CardContent className="p-5 overflow-visible space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manual Fallback Search</p>
                <form onSubmit={handleManualSubmit} className="relative flex gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search by Name or Student No..." 
                      className="pl-10 h-11 bg-gray-50/70 border-gray-200 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#35408e]"
                      value={manualQuery}
                      onChange={e => setManualQuery(e.target.value)}
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {manualQuery.length >= 2 && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-gray-50">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setManualQuery(user.student_no)
                              handleManualSubmit(undefined, user.student_no)
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                          >
                            <div>
                              <span className="font-bold text-gray-900 text-sm block group-hover:text-[#35408e] transition-colors">{user.full_name}</span>
                              <span className="text-xs text-gray-400 font-mono">{user.student_no}</span>
                            </div>
                            <span className="text-xs font-semibold text-[#35408e] bg-blue-50 px-2.5 py-1 rounded-md">Check In</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="h-11 px-7 bg-[#35408e] hover:bg-[#2a3370] text-white rounded-xl font-bold transition-all shadow-xs">
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-gray-200/80 shadow-xs bg-gray-50/50 rounded-2xl">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No events available at the moment</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                The scanner will automatically become available 1 hour before the next scheduled event starts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Feed (Right Column) */}
      <div className="lg:col-span-5">
        <Card className="h-full max-h-[800px] flex flex-col border-gray-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 p-4 sm:p-5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
                <Activity className="w-4 h-4 text-[#35408e]" /> Live Feed
              </CardTitle>
              {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Headcount (Recent): <span className="font-bold text-gray-900">{Math.max(0, headcount)}</span></p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-gray-100">
              {!selectedEvent ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Waiting for an active event...
                </div>
              ) : filteredFeed.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Waiting for scans...
                </div>
              ) : (
                filteredFeed.map((entry: any) => (
                  <div key={entry.id} className="p-4 hover:bg-gray-50/80 transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{entry.users?.full_name}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{entry.users?.student_no}</p>
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${entry.type === 'time_in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'}`}>
                        {entry.type === 'time_in' ? 'TIME IN' : 'TIME OUT'}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-end">
                      <div className="text-[11px] text-gray-400 font-medium flex gap-3">
                        <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span title={`Recorded by: ${entry.officer?.full_name || 'System Admin'}`}>
                          Recorded by: {(() => {
                            const name = entry.officer?.full_name
                            if (!name || name === 'System Admin') return 'System Admin'
                            const parts = name.trim().split(' ')
                            if (parts.length === 1) return parts[0]
                            return `${parts[0]} ${parts[parts.length - 1][0]}.`
                          })()}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => handleDeleteScan(entry.id, entry.users?.full_name)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
