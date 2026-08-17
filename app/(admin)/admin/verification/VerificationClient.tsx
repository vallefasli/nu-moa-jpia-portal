'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { ActionButtons } from './ActionButtons'
import { Inbox, ChevronRight, Search, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const filteredUsers = users?.filter(user => 
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.student_no || '').includes(searchQuery)
  ) || []

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

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name or student number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200 shadow-sm rounded-xl h-10 w-full md:max-w-md"
            />
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
                  className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group ${isSelected ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-100'}`}
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
                    <div 
                      className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
                      onClick={() => setSelectedUser(pendingUser)}
                    >
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

                  <div 
                    className="flex items-center gap-4 flex-shrink-0 ml-4 cursor-pointer"
                    onClick={() => setSelectedUser(pendingUser)}
                  >
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
    </>
  )
}
