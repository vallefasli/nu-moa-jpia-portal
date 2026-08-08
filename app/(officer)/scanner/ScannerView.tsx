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

export function ScannerView({ activeEvents, initialFeed }: { activeEvents: any[], initialFeed: any[] }) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [manualQuery, setManualQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
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

  const headcount = initialFeed.reduce((acc: number, entry: any) => {
    return entry.type === 'time_in' ? acc + 1 : acc - 1
  }, 0)

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8">
      {/* Scanner & Controls (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        
        {selectedEvent ? (
          <>
            {/* Event Selector */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg text-[#fbb03b]">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="flex-1 text-lg font-bold text-gray-900">
                  {activeEvents.find(ev => ev.id === selectedEvent)?.title || "No active event"}
                </div>
              </CardContent>
            </Card>

            {/* The Camera Scanner */}
            <QrScanner eventId={selectedEvent} onScanComplete={handleScanComplete} />

            {/* Manual Fallback with Autocomplete */}
            <Card className="border-gray-200 shadow-sm overflow-visible">
              <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300" />
              <CardContent className="p-5 overflow-visible">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Manual Fallback Search</p>
                <form onSubmit={handleManualSubmit} className="relative flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input 
                      placeholder="Search by Name or Student No..." 
                      className="pl-10 h-11 bg-gray-50 border-gray-200"
                      value={manualQuery}
                      onChange={e => setManualQuery(e.target.value)}
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {manualQuery.length >= 2 && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setManualQuery(user.student_no)
                              handleManualSubmit(undefined, user.student_no)
                            }}
                            className="w-full flex flex-col items-start px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <span className="font-bold text-gray-900 text-sm">{user.full_name}</span>
                            <span className="text-xs text-gray-500 font-mono">{user.student_no}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="h-11 px-8 bg-gray-900 hover:bg-gray-800">
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-gray-200 shadow-sm bg-gray-50/50">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
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
        <Card className="h-full max-h-[800px] flex flex-col border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Live Feed
              </CardTitle>
              {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <p className="text-xs text-gray-500 font-medium">Headcount (Recent): {Math.max(0, headcount)}</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-gray-50">
              {initialFeed.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Waiting for scans...
                </div>
              ) : (
                initialFeed.map((entry: any) => (
                  <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{entry.users?.full_name}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">{entry.users?.student_no}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${entry.type === 'time_in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entry.type === 'time_in' ? 'TIME IN' : 'TIME OUT'}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-end">
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex gap-4">
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                        <span>Officer ID: {entry.officer_id.split('-')[0]}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
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
  )
}
