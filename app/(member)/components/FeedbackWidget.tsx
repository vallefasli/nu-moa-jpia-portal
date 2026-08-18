'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, X } from 'lucide-react'
import { submitFeedback } from '../actions'
import { toast } from 'sonner'

export function FeedbackWidget({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState('feature_request')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    const res = await submitFeedback(userId, type, message)
    setIsSubmitting(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Thank you for your feedback!')
      setIsOpen(false)
      setMessage('')
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-24 right-4 md:bottom-6 md:right-6 p-3.5 sm:p-4 bg-gradient-to-r from-[#35408e] to-[#2a3370] text-white rounded-full shadow-lg shadow-blue-900/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center group ring-2 ring-white/50"
        title="Send Feedback"
        aria-label="Send Feedback"
      >
        <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden md:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 font-semibold text-sm">
          Feedback
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            className="bg-white w-full max-w-sm rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300 border border-gray-100 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#35408e]/5 via-white to-amber-50/30 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
                <div className="p-1.5 rounded-lg bg-[#35408e]/10 text-[#35408e]">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                Send Feedback
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#35408e]/20 focus:border-[#35408e] outline-none transition-all font-medium text-gray-900"
                >
                  <option value="feature_request">Feature Request</option>
                  <option value="bug">Report a Bug</option>
                  <option value="attendance_dispute">Attendance Dispute</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we improve your experience with the portal?"
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 text-base sm:text-sm focus:ring-2 focus:ring-[#35408e]/20 focus:border-[#35408e] focus:bg-white outline-none resize-none transition-all placeholder:text-gray-400 text-gray-900"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#35408e] to-[#2a3370] hover:from-[#2a3370] hover:to-[#22295a] text-white font-bold rounded-xl h-11 shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
