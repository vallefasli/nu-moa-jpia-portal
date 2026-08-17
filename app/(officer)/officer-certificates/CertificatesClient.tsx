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
import Image from 'next/image'

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
  const [eventSearchQuery, setEventSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()))

  const selectedEvent = events.find(e => e.id === selectedEventId)

  const handleCardClick = async (event: any) => {
    setSelectedEventId(event.id)
    setTemplateUrl(event.certificate_link || '')
    setIsModalOpen(true)
    setIsLoadingFeedbacks(true)
    setFeedbacks([])
    setSearchQuery('')
    setSelectedUsers(new Set())
    
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
    const isAll = selectedUsers.size === 0 || selectedUsers.size === feedbacks.length
    const userIds = isAll ? undefined : Array.from(selectedUsers)
    const res = await distributeCertificates(selectedEventId, templateUrl, userIds)
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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Search events..."
          value={eventSearchQuery}
          onChange={(e) => setEventSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus-visible:ring-[#35408e]"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {eventSearchQuery ? 'No events match your search.' : 'No events found.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event) => {
            const hasLink = !!event.certificate_link
            const effectiveStatus = getEventStatus(event)
            const eventDate = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
            
            return (
              <div 
                key={event.id}
                onClick={() => handleCardClick(event)}
                className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-[#35408e]/30 hover:shadow-xl hover:shadow-[#35408e]/5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#35408e] to-[#fbb03b] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Icon & Details */}
                <div className="flex-1 flex items-start md:items-center gap-4 pl-1 sm:pl-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors relative overflow-hidden ${
                    event.poster_url ? 'bg-gray-100' :
                    hasLink ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 group-hover:bg-[#35408e]/5 group-hover:text-[#35408e]'
                  }`}>
                    {event.poster_url ? (
                      <Image 
                        src={event.poster_url} 
                        alt={event.title} 
                        fill 
                        sizes="48px"
                        className="object-cover" 
                      />
                    ) : hasLink ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Award className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#35408e] transition-colors leading-tight mb-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {eventDate}</span>
                      <span className="flex items-center gap-1.5 font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md"><User className="w-3.5 h-3.5 text-gray-400" /> {event.feedbackCount || 0} Feedbacks</span>
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-wrap items-center gap-3 md:justify-end border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                  <Badge 
                    variant={effectiveStatus === 'ongoing' ? 'default' : 'secondary'} 
                    className={
                      effectiveStatus === 'ongoing' ? 'bg-emerald-500 text-white font-bold shadow-sm' : 
                      effectiveStatus === 'completed' ? 'bg-gray-100 text-gray-600 border-none' : ''
                    }
                  >
                    {effectiveStatus.toUpperCase()}
                  </Badge>
                  {hasLink ? (
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 gap-1.5 px-3 py-1 shadow-sm">
                      <LinkIcon className="w-3.5 h-3.5" /> Link Distributed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-200 text-gray-500 gap-1.5 px-3 py-1 group-hover:border-[#fbb03b] group-hover:text-[#fbb03b] group-hover:bg-[#fbb03b]/5 transition-colors shadow-sm">
                      <Award className="w-3.5 h-3.5" /> Needs Certificate
                    </Badge>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#35408e] group-hover:text-white group-hover:border-[#35408e] transition-colors ml-1 hidden sm:flex">
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
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
                  <>
                    <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300 w-4 h-4 text-[#35408e] focus:ring-[#35408e]"
                          checked={selectedUsers.size === filteredFeedbacks.length && filteredFeedbacks.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUsers(new Set(filteredFeedbacks.map(f => f.user_id)))
                            else setSelectedUsers(new Set())
                          }}
                        />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select All Members ({selectedUsers.size} of {feedbacks.length})</span>
                      </label>
                    </div>
                    
                    <div className="flex flex-col divide-y divide-gray-100">
                        {filteredFeedbacks.map((feedback) => (
                          <div key={feedback.user_id} className="flex gap-4 p-6 hover:bg-gray-50/50 transition-colors group">
                            <div className="pt-1">
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 w-4 h-4 text-[#35408e] focus:ring-[#35408e]"
                                checked={selectedUsers.has(feedback.user_id)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedUsers)
                                  if (e.target.checked) newSet.add(feedback.user_id)
                                  else newSet.delete(feedback.user_id)
                                  setSelectedUsers(newSet)
                                }}
                              />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                <div>
                                  <div className="font-bold text-lg text-gray-900 group-hover:text-[#35408e] transition-colors">{feedback.users.full_name}</div>
                                  <div className="text-sm text-gray-500 font-mono">{feedback.users.student_no}</div>
                                </div>
                                <div className="flex items-center gap-1 bg-white p-1.5 rounded-full border border-gray-100 shadow-sm">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < feedback.rating ? 'text-[#fbb03b]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              
                              {feedback.comment && (
                                <div className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                                  <div className="absolute top-0 left-4 -mt-2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 transform"></div>
                                  "{feedback.comment}"
                                </div>
                              )}
                              
                              {/* Custom Responses */}
                              {feedback.additional_responses && Object.keys(feedback.additional_responses).length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                  {selectedEvent?.custom_feedback_questions?.map((q: any, idx: number) => {
                                    const answer = feedback.additional_responses[q.id] ?? feedback.additional_responses[q.question]
                                    if (answer === undefined || answer === null || answer === '') return null
                                    
                                    const questionTitle = q.question
                                    const displayAnswer = Array.isArray(answer) ? answer.join(', ') : String(answer)
                                    
                                    // If it's a paragraph response, let it take full width
                                    const isLongText = q.type === 'text_long' || displayAnswer.length > 50

                                    return (
                                      <div key={idx} className={`bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex flex-col ${isLongText ? 'sm:col-span-2' : ''}`}>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">{questionTitle}</span>
                                        <span className="text-sm text-gray-800 font-medium whitespace-pre-wrap break-words">{displayAnswer}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                  </>
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
                {selectedUsers.size > 0 && selectedUsers.size < feedbacks.length && (
                  <p className="text-[10px] text-blue-600 font-medium bg-blue-50 p-2 rounded border border-blue-100">
                    Distributing to {selectedUsers.size} selected members only.
                  </p>
                )}
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
