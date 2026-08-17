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
  type: 'text' | 'text_short' | 'text_long' | 'rating' | 'multiple_choice' | 'checkboxes' | 'dropdown'
  options?: string[]
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
      <DialogContent className="sm:max-w-2xl max-h-[95dvh] sm:max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <DialogHeader>
            <DialogTitle>Event Feedback</DialogTitle>
            <DialogDescription>
              Let us know what you thought about <span className="font-bold">{eventTitle}</span>! Your feedback helps us improve future events.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
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
              {q.type === 'text' || q.type === 'text_short' ? (
                <Input 
                  value={customAnswers[answerKey] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                  placeholder="Your answer..."
                />
              ) : q.type === 'text_long' ? (
                <textarea
                  value={customAnswers[answerKey] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                  placeholder="Your answer..."
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#35408e] resize-none"
                />
              ) : q.type === 'multiple_choice' ? (
                <div className="flex flex-col gap-2 mt-2">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name={answerKey}
                        value={opt}
                        checked={customAnswers[answerKey] === opt}
                        onChange={(e) => setCustomAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                        className="w-4 h-4 text-[#35408e] border-gray-300 focus:ring-[#35408e]"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : q.type === 'checkboxes' ? (
                <div className="flex flex-col gap-2 mt-2">
                  {q.options?.map((opt, i) => {
                    const isChecked = Array.isArray(customAnswers[answerKey]) && customAnswers[answerKey].includes(opt)
                    return (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          value={opt}
                          checked={isChecked}
                          onChange={(e) => {
                            const currentArray = Array.isArray(customAnswers[answerKey]) ? [...customAnswers[answerKey]] : []
                            if (e.target.checked) {
                              setCustomAnswers(prev => ({ ...prev, [answerKey]: [...currentArray, opt] }))
                            } else {
                              setCustomAnswers(prev => ({ ...prev, [answerKey]: currentArray.filter(v => v !== opt) }))
                            }
                          }}
                          className="w-4 h-4 text-[#35408e] rounded border-gray-300 focus:ring-[#35408e]"
                        />
                        {opt}
                      </label>
                    )
                  })}
                </div>
              ) : q.type === 'dropdown' ? (
                <select
                  value={customAnswers[answerKey] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#35408e]"
                >
                  <option value="" disabled>Select an option</option>
                  {q.options?.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  {(q.options?.[0] || q.options?.[1]) && (
                    <div className="flex items-center justify-between max-w-sm px-1">
                      <span className="text-xs text-gray-500 font-medium">{q.options?.[0] || ''}</span>
                      <span className="text-xs text-gray-500 font-medium">{q.options?.[1] || ''}</span>
                    </div>
                  )}
                  <div className="flex gap-4 sm:gap-6 justify-between max-w-sm">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="flex flex-col items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{num}</span>
                        <button
                          type="button"
                          onClick={() => setCustomAnswers(prev => ({ ...prev, [answerKey]: num }))}
                          className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                            (customAnswers[answerKey] || 0) === num 
                              ? 'border-[#35408e] bg-[#35408e] ring-4 ring-blue-100' 
                              : 'border-gray-300 bg-white hover:border-[#35408e]'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )})}

          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <DialogFooter>
              <Button type="submit" disabled={loading || rating === 0} className="w-full bg-[#fbb03b] hover:bg-[#e09e35] text-white">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Feedback & Unlock Certificate
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
