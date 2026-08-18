'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateFeedbackStatus, deleteFeedback } from './actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { 
  Search, 
  UserCheck, 
  AlertCircle, 
  Bug, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  ExternalLink,
  SlidersHorizontal,
  X,
  User,
  Clock,
  MessageSquare
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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

export function FeedbackClient({
  initialFeedbacks,
  isAdmin
}: {
  initialFeedbacks: any[]
  isAdmin: boolean
}) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Calculate open count
  const openCount = feedbacks.filter(f => f.status === 'open').length

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open'
    startTransition(async () => {
      const res = await updateFeedbackStatus(id, nextStatus)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(nextStatus === 'resolved' ? 'Ticket marked as resolved.' : 'Ticket reopened.')
        setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: nextStatus } : f))
      }
    })
  }

  const handleDelete = () => {
    if (!feedbackToDelete) return
    startTransition(async () => {
      const res = await deleteFeedback(feedbackToDelete)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Feedback deleted.')
        setFeedbacks(feedbacks.filter(f => f.id !== feedbackToDelete))
      }
      setFeedbackToDelete(null)
    })
  }

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'profile_update':
        return 'Profile Update'
      case 'attendance_dispute':
        return 'Attendance Dispute'
      case 'bug':
        return 'Bug Report'
      case 'feature_request':
        return 'Feature Request'
      default:
        return 'General Feedback'
    }
  }

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  const resetFilters = () => {
    setSelectedCategory('all')
    setStatusFilter('all')
    setIsFilterDialogOpen(false)
  }

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(item => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && item.type !== selectedCategory) {
      return false
    }

    // 2. Status Filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const userName = item.users?.full_name?.toLowerCase() || ''
      const studentNo = item.users?.student_no?.toLowerCase() || ''
      const memberId = item.users?.member_id?.toLowerCase() || ''
      const message = item.message?.toLowerCase() || ''
      if (!userName.includes(q) && !studentNo.includes(q) && !memberId.includes(q) && !message.includes(q)) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Minimal Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
            Support & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review member inquiries, profile update requests, and reports.
          </p>
        </div>

        <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 font-semibold bg-white border border-gray-200 text-gray-700 shadow-xs shrink-0">
          {openCount} Open {openCount === 1 ? 'Ticket' : 'Tickets'}
        </Badge>
      </div>

      {/* 2. Search Bar + Filter Button */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search name, student no, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200 shadow-xs rounded-xl h-10 text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-[#35408e]"
            />
          </div>

          <Button 
            variant="outline" 
            className="h-10 px-3.5 sm:px-4 rounded-xl border-gray-200 shadow-xs hover:bg-gray-50 flex items-center gap-1.5 text-gray-700 shrink-0 transition-all bg-white font-semibold"
            onClick={() => setIsFilterDialogOpen(true)}
            title="Filter Submissions"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-xs sm:text-sm">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#35408e] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-medium text-gray-400">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-xs font-medium">
                <span>Category: {getCategoryLabel(selectedCategory)}</span>
                <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-gray-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-xs font-medium">
                <span>Status: {statusFilter === 'open' ? 'Open Only' : 'Resolved Only'}</span>
                <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-gray-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-[#35408e] font-semibold hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 3. Feedback Feed List */}
      <div className="space-y-3">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-10 sm:p-14 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">No submissions found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search query or filter options.'
                : 'Member feedback and profile update requests will appear here.'}
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((item) => {
            const isResolved = item.status === 'resolved'
            const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            const initials = (item.users?.full_name || 'Member')
              .split(' ')
              .filter(Boolean)
              .map((n: string) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()

            return (
              <Card 
                key={item.id} 
                className={`bg-white border transition-all rounded-2xl shadow-xs overflow-hidden ${
                  isResolved ? 'border-gray-200/60 opacity-75' : 'border-gray-200/90 hover:border-gray-300'
                }`}
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  {/* Top Bar: Member Info & Category / Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
                    {/* Member Meta */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border border-gray-200">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                            {item.users?.full_name || 'Anonymous User'}
                          </span>
                          {item.users?.member_id && (
                            <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-[10px] font-bold rounded font-mono">
                              {item.users.member_id}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs text-gray-400 font-medium">
                          <span>{item.users?.student_no}</span>
                          {item.users?.committee && (
                            <>
                              <span>&bull;</span>
                              <span className="text-gray-600">{item.users.committee} Committee</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Clean Badges */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <Badge variant="outline" className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-50 border-gray-200 text-gray-700">
                        {getCategoryLabel(item.type)}
                      </Badge>

                      {isResolved ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          <span>Open</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 sm:p-3.5">
                    <p className="text-xs sm:text-sm text-gray-800 font-medium whitespace-pre-line leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Footer Strip: Date & Actions */}
                  <div className="flex items-center justify-between gap-3 pt-0.5 text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Jump to Member Profile if Profile Update */}
                      {item.type === 'profile_update' && item.users?.student_no && (
                        <Link
                          href={`/admin/members?search=${encodeURIComponent(item.users.student_no)}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-[#35408e] text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-2xs"
                        >
                          <User className="w-3 h-3" />
                          <span>Edit Member</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-gray-400" />
                        </Link>
                      )}

                      {/* Toggle Resolved / Reopen */}
                      <Button
                        type="button"
                        size="sm"
                        variant={isResolved ? "outline" : "default"}
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className={`h-8 text-xs font-bold rounded-xl shadow-2xs active:scale-95 transition-all ${
                          isResolved 
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {isResolved ? (
                          <>
                            <RotateCcw className="w-3 h-3 mr-1 text-gray-400" />
                            Reopen
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Mark Resolved
                          </>
                        )}
                      </Button>

                      {/* Delete Action */}
                      {isAdmin && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setFeedbackToDelete(item.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* 4. Filter Dialog Modal */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-base sm:text-lg font-bold text-gray-900">
              Filter Submissions
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Narrow down inquiries and feedback by category and status.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs sm:text-sm font-medium text-gray-900 focus:ring-1 focus:ring-[#35408e] outline-none"
              >
                <option value="all">All Categories</option>
                <option value="profile_update">Profile Updates</option>
                <option value="attendance_dispute">Attendance Disputes</option>
                <option value="bug">Bug Reports</option>
                <option value="feature_request">Feature Requests</option>
                <option value="other">General / Other</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Ticket Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs sm:text-sm font-medium text-gray-900 focus:ring-1 focus:ring-[#35408e] outline-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open Only</option>
                <option value="resolved">Resolved Only</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 h-9"
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              onClick={() => setIsFilterDialogOpen(false)}
              className="bg-[#35408e] hover:bg-[#28306e] text-white text-xs font-bold px-4 h-9 rounded-xl shadow-xs"
            >
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. Delete Confirmation Dialog */}
      <AlertDialog open={!!feedbackToDelete} onOpenChange={(open) => !open && setFeedbackToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Delete Feedback Item</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete this submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
