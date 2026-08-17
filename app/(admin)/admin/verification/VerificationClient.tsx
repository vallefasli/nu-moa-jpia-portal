'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { ActionButtons } from './ActionButtons'
import { Inbox, ChevronRight, Search, Check, X, Filter, SlidersHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { approveUsers, rejectUsers } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type PendingUser = {
  id: string
  full_name: string
  student_no: string
  member_id: string
  program: string
  year_level: string
  committee: string
  email: string
  student_email?: string
  created_at: string
  account_status: string
}

export function VerificationClient({ users, isAdmin }: { users: PendingUser[], isAdmin: boolean }) {
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    program: 'All',
    year_level: 'All',
    committee: 'All',
    dateApplied: 'All'
  })
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.program !== 'All') count++;
    if (filters.year_level !== 'All') count++;
    if (filters.committee !== 'All') count++;
    if (filters.dateApplied !== 'All') count++;
    return count;
  }
  
  const resetFilters = () => {
    setFilters({
      program: 'All',
      year_level: 'All',
      committee: 'All',
      dateApplied: 'All'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Irregular']

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchQuery || 
      (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (user.student_no || '').includes(searchQuery) ||
      (user.program?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    const matchesYear = filters.year_level === 'All' || 
      (filters.year_level === 'Irregular' ? !yearLevels.slice(0, 5).includes(user.year_level) : user.year_level === filters.year_level);

    const matchesProgram = filters.program === 'All' || user.program === filters.program;
    const matchesCommittee = filters.committee === 'All' || (user.committee || 'None') === filters.committee;
    
    let matchesDate = true;
    if (filters.dateApplied !== 'All') {
       const userDate = new Date(user.created_at);
       const now = new Date();
       if (filters.dateApplied === 'Last 7 Days') {
         const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
         matchesDate = userDate >= sevenDaysAgo;
       } else if (filters.dateApplied === 'Last 30 Days') {
         const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
         matchesDate = userDate >= thirtyDaysAgo;
       } else if (filters.dateApplied === 'This Year') {
         matchesDate = userDate.getFullYear() === new Date().getFullYear();
       }
    }
      
    return matchesSearch && matchesYear && matchesProgram && matchesCommittee && matchesDate;
  }) || []

  const toggleSelection = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return
    startTransition(async () => {
      const res = await approveUsers(Array.from(selectedIds))
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Successfully approved ${selectedIds.size} accounts!`)
        setSelectedIds(new Set())
      }
    })
  }

  const handleBulkReject = () => {
    if (selectedIds.size === 0) return
    startTransition(async () => {
      const res = await rejectUsers(Array.from(selectedIds))
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Rejected ${selectedIds.size} accounts.`)
        setSelectedIds(new Set())
      }
    })
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verification Queue</h1>
            <p className="text-gray-500 mt-1">Manage pending membership applications.</p>
          </div>
          <div>
            <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">
              {users?.length || 0} Pending {users?.length === 1 ? 'Account' : 'Accounts'}
            </Badge>
          </div>
        </div>

        {/* Search & Advanced Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
          <div className="relative flex-1 w-full flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search by name, student no, or program..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-gray-200 shadow-sm rounded-xl h-10 w-full"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="h-10 px-4 rounded-xl border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 w-full sm:w-auto shrink-0 transition-colors bg-white"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-[#35408e] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>
          {filteredUsers.length > 0 && isAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-gray-200 px-4 h-10 rounded-xl shadow-sm w-full sm:w-auto">
              <Checkbox 
                id="select-all" 
                checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                onCheckedChange={(c) => toggleAll(c as boolean)}
                className="data-checked:bg-[#35408e] data-checked:border-[#35408e]"
              />
              <label htmlFor="select-all" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Select All
              </label>
            </div>
          )}
        </div>

        {(!users || users.length === 0) ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Inbox className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Queue is empty</h3>
              <p className="text-gray-500 max-w-md">There are no pending accounts to verify at the moment. You're all caught up!</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500">No applicants match your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((pendingUser) => {
              const isSelected = selectedIds.has(pendingUser.id);
              return (
                <div 
                  key={pendingUser.id} 
                  className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer ${isSelected ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-100'}`}
                  onClick={() => setSelectedUser(pendingUser)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {isAdmin && (
                      <div className="flex items-center h-full mr-1" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(c) => toggleSelection(pendingUser.id, c as boolean)}
                          className="data-checked:bg-[#35408e] data-checked:border-[#35408e]"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        {getInitials(pendingUser.full_name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{pendingUser.full_name}</h3>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-0.5">
                          <span className="font-medium text-[#35408e] truncate">{pendingUser.student_no}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="hidden sm:inline truncate">{new Date(pendingUser.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <Badge className="hidden md:flex bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0">
                      Pending
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Bar for Bulk Actions */}
      {selectedIds.size > 0 && isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md animate-in slide-in-from-bottom-10 fade-in">
          <div className="bg-[#35408e] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-[#28306e]">
            <span className="text-sm font-medium pl-2">
              <span className="bg-white text-[#35408e] rounded-md px-2 py-0.5 mr-2 text-xs font-bold">{selectedIds.size}</span>
              Selected
            </span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:text-red-100 hover:bg-[#28306e] h-8 px-3"
                disabled={isPending}
                onClick={handleBulkReject}
              >
                Reject
              </Button>
              <Button 
                size="sm" 
                className="bg-green-500 hover:bg-green-400 text-white h-8 px-4 border-0"
                disabled={isPending}
                onClick={handleBulkApprove}
              >
                Approve All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Modal for individual details */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl">
          {selectedUser && (
            <>
              <div className="sr-only">
                 <DialogHeader>
                   <DialogTitle>{selectedUser.full_name}</DialogTitle>
                 </DialogHeader>
              </div>

              <div className="bg-[#35408e] p-6 text-white flex flex-col items-center text-center relative rounded-t-2xl">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl text-white mb-3 backdrop-blur-sm border border-white/30">
                  {getInitials(selectedUser.full_name)}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {selectedUser.full_name}
                </h2>
                <DialogDescription className="text-blue-100 m-0">
                  {selectedUser.email}
                </DialogDescription>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 font-medium mb-1">Student No.</div>
                    <div className="font-semibold text-gray-900">{selectedUser.student_no}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 font-medium mb-1">Member ID</div>
                    <div className="font-semibold text-gray-900">{selectedUser.member_id}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-1">Program & Year</div>
                    <div className="font-medium text-gray-900">{selectedUser.program} • {selectedUser.year_level}</div>
                  </div>
                  {selectedUser.committee && selectedUser.committee !== 'None' && (
                    <div>
                      <div className="text-xs text-gray-500 font-medium mb-1">Committee</div>
                      <div className="font-medium text-gray-900">{selectedUser.committee}</div>
                    </div>
                  )}
                  {selectedUser.student_email && (
                    <div>
                      <div className="text-xs text-gray-500 font-medium mb-1">Student Email</div>
                      <div className="font-medium text-gray-900">{selectedUser.student_email}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-1">Date Applied</div>
                    <div className="font-medium text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="pt-2">
                  {isAdmin ? (
                    <ActionButtons 
                      userId={selectedUser.id} 
                      className="w-full flex-col sm:flex-row" 
                      onSuccess={() => {
                        setSelectedUser(null)
                        // If it was selected, remove it
                        if (selectedIds.has(selectedUser.id)) {
                          const newSet = new Set(selectedIds)
                          newSet.delete(selectedUser.id)
                          setSelectedIds(newSet)
                        }
                      }} 
                    />
                  ) : (
                    <div className="text-center p-3 bg-gray-50 rounded-xl text-sm text-gray-500 italic">
                      Admin access required to approve or reject.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl w-[95vw] max-h-[80vh] flex flex-col">
          <DialogHeader className="p-4 sm:p-6 sm:pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#35408e]" /> Filter Applicants
            </DialogTitle>
            <DialogDescription>
              Narrow down the verification queue using the criteria below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Program</Label>
              <div className="flex flex-wrap gap-2">
                {['All', 'BS Accountancy', 'BS Management Accounting', 'BS Business Administration'].map(prog => (
                  <button
                    key={prog}
                    onClick={() => setFilters(f => ({ ...f, program: prog }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${filters.program === prog ? 'bg-[#35408e] text-white border-[#35408e]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#35408e]/50'}`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Year Level</Label>
              <div className="flex flex-wrap gap-2">
                {['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Irregular'].map(year => (
                  <button
                    key={year}
                    onClick={() => setFilters(f => ({ ...f, year_level: year }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${filters.year_level === year ? 'bg-[#35408e] text-white border-[#35408e]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#35408e]/50'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Committee</Label>
              <div className="flex flex-wrap gap-2">
                {['All', 'None', 'Academics', 'Non-Academics', 'Membership', 'Finance', 'Audit', 'Communications', 'Creatives', 'Logistics'].map(com => (
                  <button
                    key={com}
                    onClick={() => setFilters(f => ({ ...f, committee: com }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${filters.committee === com ? 'bg-[#35408e] text-white border-[#35408e]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#35408e]/50'}`}
                  >
                    {com}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Date Applied</Label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Last 7 Days', 'Last 30 Days', 'This Year'].map(date => (
                  <label key={date} className="flex items-center gap-2 cursor-pointer group px-2 py-1">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.dateApplied === date ? 'border-[#35408e] bg-[#35408e]' : 'border-gray-300 bg-white group-hover:border-[#35408e]/50'}`}>
                      {filters.dateApplied === date && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm text-gray-700">{date === 'All' ? 'Any Time' : date}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between rounded-b-2xl flex-shrink-0">
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-gray-900 px-4"
              onClick={resetFilters}
            >
              Reset All
            </Button>
            <Button 
              className="bg-[#35408e] hover:bg-[#28306e] text-white px-6"
              onClick={() => setIsFilterDialogOpen(false)}
            >
              Show Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
