'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestProfileUpdate } from './actions'
import { toast } from 'sonner'
import { UserCheck, X, Loader2, Send } from 'lucide-react'

export function ProfileUpdateModal({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [field, setField] = useState('Committee')
  const [requestedValue, setRequestedValue] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedValue.trim()) {
      toast.error('Please specify what you would like to update.')
      return
    }

    setIsSubmitting(true)
    const res = await requestProfileUpdate(field, requestedValue, reason)
    setIsSubmitting(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Your profile update request has been submitted to the Admin team!')
      setIsOpen(false)
      setRequestedValue('')
      setReason('')
    }
  }

  return (
    <>
      <div className="text-center mt-8 sm:mt-12">
        <Button 
          type="button"
          onClick={() => setIsOpen(true)}
          variant="outline" 
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full px-6 sm:px-8 h-10 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
        >
          Request Profile Update
        </Button>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-2.5 font-medium">
          To update your official personal or org details, submit a request for Admin review.
        </p>
      </div>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 border border-gray-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#35408e]/5 via-white to-amber-50/40 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#35408e]/10 text-[#35408e]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                    Request Profile Update
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    Submissions are reviewed by JPIA Administrators
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Information to Change
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-xs sm:text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#35408e]/20 focus:border-[#35408e] outline-none transition-all"
                >
                  <option value="Committee">Committee Assignment</option>
                  <option value="Full Name">Full Name / Spelling Correction</option>
                  <option value="Student Number">Student Number</option>
                  <option value="Program & Year Level">Program / Year Level</option>
                  <option value="Student Email">Student Email</option>
                  <option value="Other Details">Other / Multiple Changes</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Requested New Value / Correction <span className="text-red-500">*</span>
                </label>
                <Input 
                  required
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  placeholder={
                    field === 'Committee' ? 'e.g. Change to Academics Committee' :
                    field === 'Full Name' ? 'e.g. Correct full name format' :
                    field === 'Student Number' ? 'e.g. 2024-1234567' :
                    'Describe the requested new details...'
                  }
                  className="bg-gray-50/70 border-gray-200 h-11 text-xs sm:text-sm rounded-xl font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Reason / Additional Notes (Optional)
                </label>
                <textarea 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this update is needed (e.g. Assigned to new committee by VP, typo in registration, etc.)"
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#35408e]/20 focus:border-[#35408e] focus:bg-white outline-none resize-none transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-10 text-xs sm:text-sm font-semibold rounded-xl text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-[#35408e] hover:bg-[#28306e] text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
