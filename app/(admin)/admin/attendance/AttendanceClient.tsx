'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Search, Filter, ShieldAlert } from 'lucide-react'
import { addAttendanceOverride, deleteAttendanceLog } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AttendanceClient({ events, initialLogs }: { events: any[], initialLogs: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')

  // Override Form State
  const [overrideEventId, setOverrideEventId] = useState<string>('')
  const [overrideStudentNo, setOverrideStudentNo] = useState<string>('')
  const [overrideType, setOverrideType] = useState<'time_in' | 'time_out'>('time_in')

  const filteredLogs = initialLogs.filter(log => {
    const matchesEvent = selectedEventId === 'all' || log.event_id === selectedEventId
    const matchesSearch = !searchQuery || 
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.student_no?.includes(searchQuery)
    return matchesEvent && matchesSearch
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance record? This cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteAttendanceLog(id)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Log deleted')
        router.refresh()
      }
    })
  }

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!overrideEventId) return toast.error('Select an event for the override.')
    if (!overrideStudentNo) return toast.error('Enter a student number.')

    startTransition(async () => {
      const res = await addAttendanceOverride(overrideEventId, overrideStudentNo, overrideType)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Successfully recorded ${overrideType} for ${res.studentName}`)
        setOverrideStudentNo('')
        router.refresh()
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      
      {/* Left Column: Logs Table */}
      <div className="lg:col-span-8 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search Name or Student No..." 
              className="pl-9 h-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-64 border rounded-md bg-white">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <select 
              className="w-full h-10 pl-9 pr-3 bg-transparent text-sm focus:outline-none appearance-none"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Recorded By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{log.user_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{log.student_no}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${log.type === 'time_in' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <div className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {log.officer_name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(log.id)} disabled={isPending} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Right Column: Override Panel */}
      <div className="lg:col-span-4">
        <Card className="border-red-100 shadow-sm sticky top-24">
          <div className="h-1 w-full bg-red-500" />
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold">Manual Override</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Use this tool to force an attendance log if a student's scanner failed or they forgot their QR code.
            </p>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Event</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-gray-50 px-3 text-sm focus-visible:outline-none"
                  value={overrideEventId}
                  onChange={e => setOverrideEventId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Event...</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Student Number</label>
                <Input 
                  placeholder="e.g. 2024-123456" 
                  className="bg-gray-50"
                  value={overrideStudentNo}
                  onChange={e => setOverrideStudentNo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideType('time_in')}
                    className={`h-10 rounded-md text-sm font-bold transition-colors ${overrideType === 'time_in' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    TIME IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideType('time_out')}
                    className={`h-10 rounded-md text-sm font-bold transition-colors ${overrideType === 'time_out' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    TIME OUT
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white mt-4 font-bold">
                {isPending ? 'Processing...' : 'Force Record'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}
