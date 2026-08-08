'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { distributeCertificates, getEventFeedbacks } from './actions'
import { getEventStatus } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, Link as LinkIcon, User, Calendar, Award, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export function CertificatesClient({
  events,
}: {
  events: any[]
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false)
  
  const [templateUrl, setTemplateUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedEvent = events.find(e => e.id === selectedEventId)

  const handleCardClick = async (event: any) => {
    setSelectedEventId(event.id)
    setTemplateUrl(event.certificate_link || '')
    setIsModalOpen(true)
    setIsLoadingFeedbacks(true)
    setFeedbacks([])
    setSearchQuery('')
    
    const res = await getEventFeedbacks(event.id)
    if (res.success && res.data) {
      setFeedbacks(res.data)
    } else {
      toast.error('Failed to load feedback submissions.')
    }
    setIsLoadingFeedbacks(false)
  }

  const filteredFeedbacks = feedbacks.filter(f => 
    f.users.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.users.student_no?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedEventId) return
    if (!templateUrl || !templateUrl.startsWith('http')) {
      toast.error('Please provide a valid Google Drive URL starting with http.')
      return
    }

    setIsSubmitting(true)
    const res = await distributeCertificates(selectedEventId, templateUrl)
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Successfully distributed the certificate link!')
      // Update local state so it reflects without page refresh
      const eventIndex = events.findIndex(e => e.id === selectedEventId)
      if (eventIndex !== -1) {
        events[eventIndex].certificate_link = templateUrl
      }
      setIsModalOpen(false)
    } else {
      toast.error(res.error || 'Failed to distribute certificates')
    }
  }

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const hasLink = !!event.certificate_link
            
            return (
              <Card 
                key={event.id} 
                className="cursor-pointer hover:shadow-md transition-all border-gray-200 group relative overflow-hidden"
                onClick={() => handleCardClick(event)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#35408e]/5 to-transparent pointer-events-none" />
                <CardContent className="p-5 flex flex-col h-full relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${hasLink ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {hasLink ? <CheckCircle2 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    {(() => {
                      const effectiveStatus = getEventStatus(event)
                      return (
                        <Badge 
                          variant={effectiveStatus === 'ongoing' ? 'default' : 'secondary'} 
                          className={
                            effectiveStatus === 'ongoing' ? 'bg-emerald-500 text-white font-bold' : 
                            effectiveStatus === 'completed' ? 'bg-gray-100 text-gray-600 border-none' : ''
                          }
                        >
                          {effectiveStatus.toUpperCase()}
                        </Badge>
                      )
                    })()}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {event.feedbackCount || 0} Feedbacks
                    </div>
                    <div className="flex items-center text-[#35408e] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                      Manage <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal for Event Details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] md:h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Review feedback and distribute the Google Drive certificate link.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Feedback List Panel */}
            <div className="flex-1 border-r border-gray-100 flex flex-col overflow-hidden bg-white">
              <div className="p-4 border-b border-gray-100 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-7 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-gray-50 border-gray-200"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                {isLoadingFeedbacks ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Loading feedbacks...</span>
                  </div>
                ) : filteredFeedbacks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No feedback submissions found.
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Member</th>
                        <th className="px-4 py-3 font-semibold">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFeedbacks.map((feedback) => (
                        <tr key={feedback.user_id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-4 py-3 align-top">
                            <div className="font-bold text-gray-900 group-hover:text-[#35408e] transition-colors">{feedback.users.full_name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 font-mono">{feedback.users.student_no}</div>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] align-top">
                            <div className="flex items-center gap-1 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              {feedback.comment || <span className="italic text-gray-400">No comment</span>}
                            </div>
                            
                            {/* Custom Responses */}
                            {feedback.additional_responses && Object.keys(feedback.additional_responses).length > 0 && (
                              <div className="mt-2 space-y-1.5 bg-gray-50 p-2 rounded-md border border-gray-100">
                                {Object.entries(feedback.additional_responses).map(([questionKey, answer]: [string, any], idx) => {
                                  const matchedQ = selectedEvent?.custom_feedback_questions?.find((q: any) => q.id === questionKey || q.question === questionKey)
                                  const questionTitle = matchedQ ? matchedQ.question : questionKey

                                  return (
                                    <div key={idx} className="text-xs">
                                      <span className="font-semibold text-gray-700 block truncate">{questionTitle}</span>
                                      <span className="text-gray-600">{String(answer)}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Action Panel */}
            <div className="md:w-[280px] bg-gray-50/50 p-6 flex flex-col gap-6">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Feedbacks
                </div>
                <div className="text-3xl font-extrabold text-gray-900">
                  {isLoadingFeedbacks ? '-' : feedbacks.length}
                </div>
              </div>
              
              <div className="h-px w-full bg-gray-200" />

              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Drive Link
                </div>
                <Input 
                  placeholder="https://drive.google.com/..."
                  value={templateUrl}
                  onChange={(e) => setTemplateUrl(e.target.value)}
                  className="text-sm bg-white border-gray-300"
                />
                <p className="text-[10px] text-gray-500 leading-tight">
                  Paste the Google Drive folder link containing the certificates.
                </p>
              </div>

              <div className="mt-auto pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || isLoadingFeedbacks}
                  className="w-full bg-[#35408e] hover:bg-[#2a3370] text-white font-bold h-11"
                >
                  {isSubmitting ? 'Saving...' : 'Distribute Link'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
