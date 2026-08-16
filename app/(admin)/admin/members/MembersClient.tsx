'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Inbox, ChevronRight, Search, Edit, Trash2, ShieldAlert, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import DigitalIdCard from '@/app/(member)/id/DigitalIdCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { removeMember, removeMembers, updateMemberProfile } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

type User = {
  id: string
  first_name?: string
  middle_name?: string
  last_name?: string
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
  role: string
  qr_token: string
}

export default function MembersClient({ initialUsers }: { initialUsers: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  const yearLevels = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Irregular']

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  // Filter logic
  const filteredUsers = initialUsers.filter(u => {
    const matchesSearch = !searchQuery || 
      (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (u.student_no || '').includes(searchQuery) ||
      (u.program?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Irregular' ? !yearLevels.slice(1, 6).includes(u.year_level) : u.year_level === activeTab);
      
    return matchesSearch && matchesTab;
  })

  const toggleSelection = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredUsers.map(u => u.id)))
    else setSelectedIds(new Set())
  }

  const handleBulkRemoveClick = () => {
    if (selectedIds.size === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const executeBulkRemove = () => {
    startTransition(async () => {
      const res = await removeMembers(Array.from(selectedIds))
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Removed ${selectedIds.size} members successfully.`)
        setSelectedIds(new Set())
      }
      setBulkDeleteDialogOpen(false)
    })
  }

  const handleSingleRemoveClick = (userId: string, name: string) => {
    setUserToDelete({ id: userId, name })
    setDeleteDialogOpen(true)
  }

  const executeSingleRemove = () => {
    if (!userToDelete) return
    startTransition(async () => {
      const res = await removeMember(userToDelete.id)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${userToDelete.name} has been removed.`)
        setIsDialogOpen(false)
        if (selectedIds.has(userToDelete.id)) toggleSelection(userToDelete.id, false)
      }
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    })
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUser) return
    const formData = new FormData(e.currentTarget)
    const first_name = formData.get('first_name') as string
    const middle_name = formData.get('middle_name') as string
    const last_name = formData.get('last_name') as string
    
    const full_name = [first_name, middle_name, last_name]
      .filter(n => n && n.trim().length > 0)
      .map(n => n.trim())
      .join(' ')

    const data = {
      full_name,
      first_name,
      middle_name,
      last_name,
      student_no: formData.get('student_no') as string,
      student_email: formData.get('student_email') as string,
      program: formData.get('program') as string,
      year_level: formData.get('year_level') as string,
      committee: formData.get('committee') as string,
      role: formData.get('role') as string,
    }

    startTransition(async () => {
      const res = await updateMemberProfile(selectedUser.id, data)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Profile updated successfully.')
        setIsDialogOpen(false)
      }
    })
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#35408e]">Manage Members</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">View and edit active JPIA members by year level.</p>
          </div>
          <div>
            <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm">
              {initialUsers?.length || 0} Active {initialUsers?.length === 1 ? 'Member' : 'Members'}
            </Badge>
          </div>
        </div>

        {/* Sleek Pill Filters */}
        <div className="flex overflow-x-auto pb-4 mb-2 gap-2 hide-scrollbar">
          {yearLevels.map((year) => (
            <button
              key={year}
              onClick={() => setActiveTab(year)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === year 
                  ? 'bg-[#35408e] text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Search & Bulk Select Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name, student no, or program..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200 shadow-sm rounded-xl h-10 w-full md:max-w-md"
            />
          </div>
          {filteredUsers.length > 0 && (
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

        {/* Main List */}
        {initialUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Inbox className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No active members</h3>
              <p className="text-gray-500 max-w-md">There are no approved members in the system yet.</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500">No members match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isSelected = selectedIds.has(user.id);
              return (
                <div 
                  key={user.id} 
                  className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group ${isSelected ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-100'}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center h-full mr-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(c) => toggleSelection(user.id, c as boolean)}
                        className="data-checked:bg-[#35408e] data-checked:border-[#35408e]"
                      />
                    </div>
                    <div 
                      className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
                      onClick={() => { setSelectedUser(user); setIsEditMode(false); setShowQR(false); setIsDialogOpen(true); }}
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{user.full_name}</h3>
                          {user.role === 'officer' && (
                            <Badge variant="secondary" className="text-[10px] uppercase bg-blue-100 text-blue-800 border-0 flex-shrink-0">
                              Officer
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-0.5">
                          <span className="font-medium text-[#35408e] truncate">{user.student_no}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="hidden sm:inline truncate">{user.program}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex items-center gap-4 flex-shrink-0 ml-4 cursor-pointer"
                    onClick={() => { setSelectedUser(user); setIsEditMode(false); setShowQR(false); setIsDialogOpen(true); }}
                  >
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

      {/* Floating Action Bar for Bulk Remove */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md animate-in slide-in-from-bottom-10 fade-in">
          <div className="bg-[#35408e] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-[#28306e]">
            <span className="text-sm font-medium pl-2">
              <span className="bg-white text-[#35408e] rounded-md px-2 py-0.5 mr-2 text-xs font-bold">{selectedIds.size}</span>
              Selected
            </span>
            <Button 
              size="sm" 
              variant="destructive"
              className="h-8 px-4 border-0"
              disabled={isPending}
              onClick={handleBulkRemoveClick}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Remove Selected
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Modal (View/Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`p-0 overflow-hidden rounded-2xl transition-[max-width] ${isEditMode ? 'sm:max-w-[600px]' : 'sm:max-w-[425px]'}`}>
          {selectedUser && !isEditMode && (
            <>
              <div className="sr-only">
                 <DialogHeader><DialogTitle>{selectedUser.full_name}</DialogTitle></DialogHeader>
              </div>

              {!showQR && (
                <div className="bg-gradient-to-br from-[#35408e] to-[#28306e] p-6 text-white flex flex-col items-center text-center relative rounded-t-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                  {selectedUser.role === 'officer' && (
                    <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <ShieldAlert className="w-3 h-3" /> Officer
                    </div>
                  )}
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center font-bold text-3xl text-white mb-3 backdrop-blur-sm border-2 border-white/30 shadow-inner">
                    {getInitials(selectedUser.full_name)}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                    {selectedUser.full_name}
                  </h2>
                  <DialogDescription className="text-blue-200 m-0 text-sm">
                    {selectedUser.email}
                  </DialogDescription>
                </div>
              )}

              <div className={`p-6 space-y-4 ${showQR ? 'pt-8' : ''}`}>
                {!showQR ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-xs text-gray-500 font-medium mb-1">Student No.</div>
                        <div className="font-semibold text-gray-900">{selectedUser.student_no}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-xs text-gray-500 font-medium mb-1">Member ID</div>
                        <div className="font-semibold text-gray-900">{selectedUser.member_id}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
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
                        <div className="text-xs text-gray-500 font-medium mb-1">Joined</div>
                        <div className="font-medium text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-200 flex justify-center pb-2">
                    <div className="w-full max-w-[340px]">
                      <DigitalIdCard 
                        profile={{
                          full_name: selectedUser.full_name,
                          student_no: selectedUser.student_no,
                          member_id: selectedUser.member_id,
                          program: selectedUser.program,
                          year_level: selectedUser.year_level,
                          qr_token: selectedUser.qr_token
                        }}
                        initials={getInitials(selectedUser.full_name)}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex flex-wrap gap-2 border-t border-gray-100 mt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-white border-gray-200"
                    onClick={() => setShowQR(!showQR)}
                  >
                    <QrCode className="w-4 h-4 mr-2" /> {showQR ? 'Back to Profile' : 'View Event Pass'}
                  </Button>
                  {!showQR && (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleSingleRemoveClick(selectedUser.id, selectedUser.full_name)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {selectedUser && isEditMode && (() => {
            const splitName = (fullName: string) => {
              const parts = fullName.split(' ').filter(Boolean);
              if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
              if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
              return {
                first: parts[0],
                middle: parts.slice(1, -1).join(' '),
                last: parts[parts.length - 1]
              };
            };
            // Fallback to splitName if the database hasn't been backfilled yet
            const { first: defaultFirst, middle: defaultMiddle, last: defaultLast } = splitName(selectedUser.full_name);
            const actualFirst = selectedUser.first_name || defaultFirst;
            const actualMiddle = selectedUser.middle_name || defaultMiddle;
            const actualLast = selectedUser.last_name || defaultLast;

            return (
            <form onSubmit={handleEditSubmit} className="flex flex-col max-h-[85vh]">
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update the details for {selectedUser.full_name}.</DialogDescription>
              </DialogHeader>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" name="first_name" defaultValue={actualFirst} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" defaultValue={actualLast} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                    <Input id="middle_name" name="middle_name" defaultValue={actualMiddle} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="student_email">Student Email</Label>
                    <Input id="student_email" name="student_email" type="email" defaultValue={selectedUser.student_email || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_no">Student Number</Label>
                    <Input id="student_no" name="student_no" defaultValue={selectedUser.student_no} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="program">Program</Label>
                    <select 
                      id="program" 
                      name="program" 
                      required 
                      defaultValue={selectedUser.program}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="BS Accountancy">BS Accountancy</option>
                      <option value="BS Management Accounting">BS Management Accounting</option>
                      <option value="BS Business Administration">BS Business Administration</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year_level">Year Level</Label>
                    <select 
                      id="year_level" 
                      name="year_level" 
                      required 
                      defaultValue={selectedUser.year_level}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                      <option value="Irregular">Irregular / Extended</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="committee">Committee</Label>
                    <select 
                      id="committee" 
                      name="committee" 
                      defaultValue={selectedUser.committee || 'None'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="None">None (General Member)</option>
                      <option value="Academics">Academics</option>
                      <option value="Non-Academics">Non-Academics</option>
                      <option value="Membership">Membership</option>
                      <option value="Finance">Finance</option>
                      <option value="Audit">Audit</option>
                      <option value="Communications">Communications</option>
                      <option value="Creatives">Creatives</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select 
                      id="role" 
                      name="role" 
                      defaultValue={selectedUser.role || 'member'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="member">Member</option>
                      <option value="officer">Officer</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 mt-auto rounded-b-2xl">
                <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-[#35408e] hover:bg-[#28306e]">
                  {isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Single User Deletion */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-gray-900">{userToDelete?.name}</span>? 
              This action cannot be undone and they will lose access to the portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                executeSingleRemove()
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Bulk User Deletion */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Multiple Members</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to completely remove <span className="font-semibold text-gray-900">{selectedIds.size} members</span>? 
              This action cannot be undone and they will lose access to the portal immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                executeBulkRemove()
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? 'Removing...' : 'Remove Selected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
