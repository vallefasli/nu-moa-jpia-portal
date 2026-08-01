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
        className="fixed bottom-6 right-6 p-4 bg-[#35408e] text-white rounded-full shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center group"
      >
        <MessageSquarePlus className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 font-semibold">
          Feedback
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-[#35408e]" />
                Send Feedback
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#35408e]/20 outline-none"
                >
                  <option value="feature_request">Feature Request</option>
                  <option value="bug">Report a Bug</option>
                  <option value="attendance_dispute">Attendance Dispute</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we improve the portal?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#35408e]/20 outline-none resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#35408e] hover:bg-[#2a3370] rounded-xl h-11"
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
