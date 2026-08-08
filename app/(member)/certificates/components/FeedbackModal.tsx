'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { submitEventFeedback } from '../actions'
import { toast } from 'sonner'
import { Loader2, Star, Send } from 'lucide-react'

interface CustomQuestion {
  id: string
  question: string
  type: 'text' | 'rating'
}

interface FeedbackModalProps {
  eventId: string
  eventTitle: string
  customQuestions?: CustomQuestion[]
}

export function FeedbackModal({ eventId, eventTitle, customQuestions = [] }: FeedbackModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)
    try {
      const res = await submitEventFeedback(eventId, rating, comment, customAnswers)
      if (res.success) {
        toast.success('Feedback submitted successfully!')
        setOpen(false)
      } else {
        toast.error(res.error || 'Failed to submit feedback')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="w-full bg-[#35408e] hover:bg-[#252d69] text-white">
          <Send className="w-4 h-4 mr-2" />
          Submit Feedback
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Event Feedback</DialogTitle>
          <DialogDescription>
            Let us know what you thought about <span className="font-bold">{eventTitle}</span>! Your feedback helps us improve future events.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Overall Rating <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded-full hover:scale-110 transition-transform ${
                    rating >= star ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">General Comments</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[100px] p-3 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#35408e] resize-none"
              placeholder="What did you like? What could be improved?"
            />
          </div>

          {customQuestions.map((q, index) => {
            const answerKey = q.id || q.question || `question_${index}`
            return (
            <div key={answerKey} className="space-y-2">
              <Label>{q.question}</Label>
              {q.type === 'text' ? (
                <Input 
                  value={customAnswers[answerKey] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                  placeholder="Your answer..."
                />
              ) : (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCustomAnswers(prev => ({ ...prev, [answerKey]: star }))}
                      className={`p-1 rounded-full hover:scale-110 transition-transform ${
                        (customAnswers[answerKey] || 0) >= star ? 'text-blue-400' : 'text-gray-200'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )})}

          <DialogFooter>
            <Button type="submit" disabled={loading || rating === 0} className="w-full bg-[#fbb03b] hover:bg-[#e09e35] text-white">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit Feedback & Unlock Certificate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
