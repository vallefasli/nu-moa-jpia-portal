'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Search, Filter, ShieldAlert, CheckSquare, Clock, UserCheck, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react'
import { addAttendanceOverride, deleteAttendanceLog, addBatchAttendanceOverride } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AttendanceClient({ events, initialLogs, activeEventId }: { events: any[], initialLogs: any[], activeEventId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [mobileTab, setMobileTab] = useState<'logs' | 'override'>('logs')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: string, name: string } | null>(null)

  // Override Form State
  const [overrideEventId, setOverrideEventId] = useState<string>(activeEventId)
  const [overrideStudentNo, setOverrideStudentNo] = useState<string>('')
  const [overrideType, setOverrideType] = useState<'time_in' | 'time_out'>('time_in')

  // Sync override event id if active event changes
  useEffect(() => {
    setOverrideEventId(activeEventId)
    setSelectedUserIds([]) // Clear selections on event change
  }, [activeEventId])

  // Sync the student number field if exactly 1 user is selected
  useEffect(() => {
    if (selectedUserIds.length === 1) {
      const selectedUser = initialLogs.find(log => log.user_id === selectedUserIds[0])
      if (selectedUser) {
        setOverrideStudentNo(selectedUser.student_no)
      }
    } else if (selectedUserIds.length === 0) {
      setOverrideStudentNo('')
    }
  }, [selectedUserIds, initialLogs])

  const filteredLogs = initialLogs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.student_no?.includes(searchQuery)
    return matchesSearch
  })

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(filteredLogs.map(log => log.user_id))
    }
  }

  const toggleSelect = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const { id, type } = deleteTarget
    startTransition(async () => {
      const res = await deleteAttendanceLog(id)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${type} record deleted`)
        setDeleteTarget(null)
        router.refresh()
      }
    })
  }

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!overrideEventId) return toast.error('Select an event for the override.')
    
    startTransition(async () => {
      let res;
      
      if (selectedUserIds.length > 0) {
        // Batch or Selection Mode
        res = await addBatchAttendanceOverride(overrideEventId, selectedUserIds, overrideType)
      } else {
        // Pure Manual Mode
        if (!overrideStudentNo) {
          toast.error('Enter a student number.')
          return
        }
        res = await addAttendanceOverride(overrideEventId, overrideStudentNo, overrideType)
      }
      
      if (res.error) {
        toast.error(res.error)
      } else {
        if (selectedUserIds.length > 1) {
          toast.success(`Successfully recorded ${overrideType.replace('_', ' ')} for ${(res as any).count} students`)
        } else {
          toast.success(`Successfully recorded ${overrideType.replace('_', ' ')} for ${(res as any).studentName || 'the student'}`)
        }
        setOverrideStudentNo('')
        setSelectedUserIds([])
        setMobileTab('logs') // Switch back to logs view on mobile
        router.refresh()
      }
    })
  }

  const formatOfficerName = (fullName?: string) => {
    if (!fullName || fullName === 'System Admin' || fullName === 'System Account') return 'System Admin'
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1][0]}.`
  }

  const currentEventTitle = events.find(ev => ev.id === activeEventId)?.title || "Select Event"

  return (
    <>
      {/* Mobile Top View Switcher (< lg) */}
      <div className="lg:hidden flex bg-gray-200/80 p-1 rounded-2xl mb-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMobileTab('logs')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'logs' ? 'bg-white text-[#35408e] shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Records ({filteredLogs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('override')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'override' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Manual Override {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Logs List / Table */}
        <div className={`lg:col-span-8 space-y-4 ${mobileTab === 'override' ? 'hidden lg:block' : 'block'}`}>
          {/* Filters & Event Selector Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search name, student #..." 
                className="pl-9 h-10 bg-white border-gray-200 shadow-xs rounded-xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-72 border border-gray-200 rounded-xl bg-white shadow-xs">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#35408e] pointer-events-none" />
              <select 
                className="w-full h-10 pl-9 pr-8 bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none appearance-none truncate"
                value={activeEventId}
                onChange={(e) => {
                  router.push(`?eventId=${e.target.value}`)
                }}
              >
                <option value="" disabled>Select an Event</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Sub-toolbar on Mobile & Desktop */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between px-1 text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-gray-900 transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 w-4 h-4 text-[#35408e] cursor-pointer"
                  checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredLogs.length}
                  ref={input => {
                    if (input) {
                      input.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredLogs.length
                    }
                  }}
                  onChange={toggleSelectAll}
                />
                <span className="font-semibold text-gray-700">
                  Select All ({filteredLogs.length})
                </span>
              </label>

              {selectedUserIds.length > 0 && (
                <button
                  onClick={() => setMobileTab('override')}
                  className="lg:hidden text-red-600 font-bold hover:underline flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Override Selected ({selectedUserIds.length})
                </button>
              )}
            </div>
          )}

          {/* 1. Mobile Cards View (< md) */}
          <div className="md:hidden space-y-3">
            {filteredLogs.map(log => {
              const isSelected = selectedUserIds.includes(log.user_id)
              return (
                <div 
                  key={log.user_id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                    isSelected ? 'border-[#35408e] bg-blue-50/30 ring-1 ring-[#35408e]/30' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 w-4 h-4 text-[#35408e] cursor-pointer mt-0.5"
                        checked={isSelected}
                        onChange={() => toggleSelect(log.user_id)}
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{log.full_name}</h4>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{log.student_no}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      log.is_registered ? 'bg-blue-50 text-[#35408e] border border-blue-200' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {log.is_registered ? 'RSVP\'d' : 'Walk-in'}
                    </span>
                  </div>

                  {/* Attendance Badges Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    {/* Time In */}
                    <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center justify-between">
                        <span>Time In</span>
                        {log.time_in_id && (
                          <button 
                            type="button"
                            onClick={() => setDeleteTarget({ id: log.time_in_id, type: 'Time In', name: log.full_name })}
                            className="text-gray-400 hover:text-red-600 p-0.5 transition-colors"
                            title="Delete Time In"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {log.time_in ? (
                        <div>
                          <div className="font-bold text-emerald-700 text-sm">
                            {new Date(log.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5">
                            by {formatOfficerName(log.time_in_officer)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 font-medium italic text-[11px]">Not recorded</div>
                      )}
                    </div>

                    {/* Time Out */}
                    <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center justify-between">
                        <span>Time Out</span>
                        {log.time_out_id && (
                          <button 
                            type="button"
                            onClick={() => setDeleteTarget({ id: log.time_out_id, type: 'Time Out', name: log.full_name })}
                            className="text-gray-400 hover:text-red-600 p-0.5 transition-colors"
                            title="Delete Time Out"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {log.time_out ? (
                        <div>
                          <div className="font-bold text-amber-700 text-sm">
                            {new Date(log.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5">
                            by {formatOfficerName(log.time_out_officer)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 font-medium italic text-[11px]">Not recorded</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredLogs.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">No participation records found</p>
                <p className="text-xs text-gray-400 mt-1">Select an active event or try a different search query.</p>
              </div>
            )}
          </div>

          {/* 2. Desktop High-Density Table (md+) */}
          <Card className="hidden md:block border-gray-200/80 shadow-xs rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 w-4 h-4 text-[#35408e] cursor-pointer"
                        checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredLogs.length}
                        ref={input => {
                          if (input) {
                            input.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredLogs.length
                          }
                        }}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3 text-center min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-center min-w-[140px]">Time In</th>
                    <th className="px-4 py-3 text-center min-w-[140px]">Time Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map(log => {
                    const isSelected = selectedUserIds.includes(log.user_id)
                    return (
                      <tr key={log.user_id} className={`bg-white hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 w-4 h-4 text-[#35408e] cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelect(log.user_id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{log.full_name}</div>
                          <div className="text-xs text-gray-500 font-mono">{log.student_no}</div>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                            log.is_registered ? 'bg-blue-50 text-[#35408e] border border-blue-200' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {log.is_registered ? 'RSVP\'d' : 'Walk-in'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center relative group">
                          {log.time_in ? (
                            <>
                              <div className="flex flex-col items-center justify-center">
                                <div className="font-semibold text-emerald-700">
                                  {new Date(log.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[80px]" title={`Recorded by: ${log.time_in_officer}`}>
                                  by {formatOfficerName(log.time_in_officer)}
                                </div>
                              </div>
                              {log.time_in_id && (
                                <button 
                                  onClick={() => setDeleteTarget({ id: log.time_in_id, type: 'Time In', name: log.full_name })} 
                                  disabled={isPending} 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 transition-opacity bg-white hover:bg-red-50 rounded-md shadow-xs border border-gray-100" 
                                  title="Delete Time In"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center relative group">
                          {log.time_out ? (
                            <>
                              <div className="flex flex-col items-center justify-center">
                                <div className="font-semibold text-amber-700">
                                  {new Date(log.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[80px]" title={`Recorded by: ${log.time_out_officer}`}>
                                  by {formatOfficerName(log.time_out_officer)}
                                </div>
                              </div>
                              {log.time_out_id && (
                                <button 
                                  onClick={() => setDeleteTarget({ id: log.time_out_id, type: 'Time Out', name: log.full_name })} 
                                  disabled={isPending} 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 transition-opacity bg-white hover:bg-red-50 rounded-md shadow-xs border border-gray-100" 
                                  title="Delete Time Out"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No participation records found for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Override Panel */}
        <div className={`lg:col-span-4 ${mobileTab === 'logs' ? 'hidden lg:block' : 'block'}`}>
          <Card className="border-red-100 shadow-xs rounded-2xl overflow-hidden sticky top-24 bg-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-amber-500" />
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                {selectedUserIds.length > 1 ? <CheckSquare className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                <h3 className="font-bold text-base text-gray-900">
                  {selectedUserIds.length > 1 ? 'Batch Override' : 'Manual Override'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                {selectedUserIds.length > 1 
                  ? `Apply attendance override to all ${selectedUserIds.length} selected students at once.` 
                  : 'Force an attendance log if a student was unable to scan their QR pass.'}
              </p>

              <form onSubmit={handleOverrideSubmit} className="space-y-4">
                {/* Active Target Event Indicator (No redundant selector) */}
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Event</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 truncate block mt-0.5" title={currentEventTitle}>
                      {currentEventTitle}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md shrink-0">
                    Active
                  </span>
                </div>

                {selectedUserIds.length > 1 ? (
                  <div className="p-3.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 text-xs">
                    <div className="font-bold">{selectedUserIds.length} students selected</div>
                    <p className="text-[11px] text-blue-700 mt-0.5">This action will be applied to all selected accounts simultaneously.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Student Number</label>
                    <Input 
                      placeholder="e.g. 2024-123456" 
                      className="bg-gray-50/70 rounded-xl text-sm h-10"
                      value={overrideStudentNo}
                      onChange={e => setOverrideStudentNo(e.target.value)}
                      required={selectedUserIds.length === 0}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Action Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOverrideType('time_in')}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        overrideType === 'time_in' 
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-[1.02]' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      TIME IN
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverrideType('time_out')}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        overrideType === 'time_out' 
                          ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 scale-[1.02]' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      TIME OUT
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white mt-4 font-bold rounded-xl shadow-md shadow-red-600/20 active:scale-[0.99] transition-all"
                >
                  {isPending ? 'Processing...' : 'Force Record Override'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
      </div>

      {/* Delete Record Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Delete {deleteTarget?.type} Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to remove the {deleteTarget?.type} timestamp for <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-end">
            <AlertDialogCancel className="rounded-xl mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
