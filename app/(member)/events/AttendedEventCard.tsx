'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, MapPin, Users, Trophy, ExternalLink, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { submitEventFeedback } from './actions'
import { toast } from 'sonner'

export function AttendedEventCard({ 
  event, 
  feedbackStatus, 
  certificateLink 
}: { 
  event: any, 
  feedbackStatus: 'none' | 'submitted', 
  certificateLink?: string 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')

  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
  const startTime = new Date(`1970-01-01T${event.time_start}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const endTime = new Date(`1970-01-01T${event.time_end}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    const res = await submitEventFeedback(event.id, rating, comment)
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Feedback submitted successfully!')
    } else {
      toast.error(res.error || 'Failed to submit feedback')
    }
  }

  return (
    <Card className={`overflow-hidden transition-all duration-500 bg-white/90 backdrop-blur-xl border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(53,64,142,0.15)] group ${isExpanded ? 'ring-2 ring-[#35408e]/20' : ''}`}>
      <div className="h-2.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:h-3 transition-all duration-500" />
      
      {/* Clickable Header/Content Area */}
      <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-bold leading-tight tracking-tight group-hover:text-emerald-700 transition-colors">
              {event.title}
            </CardTitle>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold tracking-widest px-3 py-1 shadow-inner flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ATTENDED
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 mt-3 text-sm leading-relaxed text-gray-500">{event.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-4">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="tracking-wide">{eventDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="tracking-wide">{startTime} - {endTime}</span>
          </div>
        </CardContent>

        <div className="px-6 pb-4 flex justify-center text-gray-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />}
        </div>
      </div>

      {/* Expanded Area */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Certificate of Attendance</h3>
            
            {certificateLink ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Your certificate is ready! You can view and download it below.</p>
                <Button asChild className="w-full bg-[#35408e] hover:bg-[#2a3370] text-white">
                  <a href={certificateLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Certificate
                  </a>
                </Button>
              </div>
            ) : feedbackStatus === 'submitted' ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">You have successfully submitted your feedback for this event. Your certificate is being processed by the officers.</p>
                <Badge className="w-full justify-center bg-amber-100 text-amber-700 hover:bg-amber-100 py-2">
                  Pending Certificate Release
                </Badge>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Please fill out this quick feedback form to request your certificate.</p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-lg transition-all ${rating >= star ? 'bg-yellow-100 text-yellow-500 scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        <Trophy className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Comments / Suggestions (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#35408e]/20 focus:border-[#35408e] outline-none transition-all min-h-[80px]"
                    placeholder="Tell us what you liked or how we can improve..."
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
