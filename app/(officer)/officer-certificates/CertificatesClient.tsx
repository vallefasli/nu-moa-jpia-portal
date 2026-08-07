'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { distributeCertificates } from './actions'
import { toast } from 'sonner'
import { Search, Link as LinkIcon, CheckCircle2, User } from 'lucide-react'

export function CertificatesClient({
  events,
  selectedEventId,
  feedbacks,
  certificates
}: {
  events: any[]
  selectedEventId: string | null
  feedbacks: any[]
  certificates: any[]
}) {
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [templateUrl, setTemplateUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedUsers(new Set()) // Reset selection
    if (val) {
      router.push(`/officer-certificates?eventId=${val}`)
    } else {
      router.push(`/officer-certificates`)
    }
  }

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedUsers)
    if (newSet.has(userId)) {
      newSet.delete(userId)
    } else {
      newSet.add(userId)
    }
    setSelectedUsers(newSet)
  }

  const toggleAll = () => {
    if (selectedUsers.size === filteredFeedbacks.length && filteredFeedbacks.length > 0) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredFeedbacks.map(f => f.user_id)))
    }
  }

  const filteredFeedbacks = feedbacks.filter(f => 
    f.users.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.users.student_no?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedEventId) return
    if (selectedUsers.size === 0) {
      toast.error('Select at least one member.')
      return
    }
    if (!templateUrl || !templateUrl.startsWith('http')) {
      toast.error('Please provide a valid Google Drive URL starting with http.')
      return
    }

    setIsSubmitting(true)
    const res = await distributeCertificates(
      selectedEventId,
      Array.from(selectedUsers),
      templateUrl
    )
    setIsSubmitting(false)

    if (res.success) {
      toast.success(`Successfully distributed links to ${selectedUsers.size} members!`)
      setSelectedUsers(new Set())
      setTemplateUrl('')
    } else {
      toast.error(res.error || 'Failed to distribute certificates')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Area */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Select Event</label>
          <select 
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#35408e]/20 focus:border-[#35408e] outline-none"
            value={selectedEventId || ''}
            onChange={handleEventChange}
          >
            <option value="">-- Choose an event --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.status})
              </option>
            ))}
          </select>
        </div>
        
        {selectedEventId && (
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Search Members</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name or student number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {selectedEventId && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members Table */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Feedback Submissions ({filteredFeedbacks.length})</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleAll}
                    className="text-xs font-bold"
                  >
                    {selectedUsers.size === filteredFeedbacks.length && filteredFeedbacks.length > 0 ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Rating & Comment</th>
                      <th className="px-4 py-3 text-right">Certificate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFeedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-gray-400 font-medium">
                          No feedback submissions found.
                        </td>
                      </tr>
                    ) : (
                      filteredFeedbacks.map((feedback) => {
                        const hasCert = certificates.some(c => c.user_id === feedback.user_id && c.template_url)
                        const isSelected = selectedUsers.has(feedback.user_id)
                        
                        return (
                          <tr 
                            key={feedback.user_id} 
                            className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-[#35408e]/5 hover:bg-[#35408e]/10' : ''}`}
                            onClick={() => toggleUser(feedback.user_id)}
                          >
                            <td className="px-4 py-3">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleUser(feedback.user_id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900">{feedback.users.full_name}</div>
                              <div className="text-xs text-gray-500">{feedback.users.member_id} • {feedback.users.student_no}</div>
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <div className="text-xs text-gray-600 truncate" title={feedback.comment}>
                                {feedback.comment || <span className="italic text-gray-400">No comment</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {hasCert ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Issued
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none">
                                  Pending
                                </Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-gray-200 sticky top-24">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  Distribute Link
                </CardTitle>
                <CardDescription className="text-xs">
                  Give selected members access to their certificate.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-[#35408e]/5 border border-[#35408e]/10 p-3 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md shadow-sm">
                    <User className="w-4 h-4 text-[#35408e]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Selected Members</div>
                    <div className="font-extrabold text-xl text-[#35408e]">{selectedUsers.size}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Google Drive Link
                  </label>
                  <Input 
                    placeholder="https://drive.google.com/..."
                    value={templateUrl}
                    onChange={(e) => setTemplateUrl(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[10px] text-gray-400">
                    This link will appear on the member's event card so they can view and download their certificate.
                  </p>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || selectedUsers.size === 0}
                  className="w-full bg-[#35408e] hover:bg-[#2a3370] text-white font-bold"
                >
                  {isSubmitting ? 'Distributing...' : 'Submit & Distribute'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
