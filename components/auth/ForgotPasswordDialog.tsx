'use client'

import { useState, useActionState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/app/(auth)/actions'
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialEmail?: string
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  initialEmail = '',
}: ForgotPasswordDialogProps) {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null)
  const [email, setEmail] = useState(initialEmail)

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [initialEmail])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-b from-gray-50/80 to-transparent border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-[#006B3C]/10 border border-[#006B3C]/20 flex items-center justify-center text-[#006B3C] mb-3">
            <KeyRound className="w-5 h-5 text-[#006B3C]" />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
            Forgot Password
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 leading-relaxed mt-1">
            Enter your registered personal email address and we&apos;ll send you a secure link to reset your password.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4">
          {/* Error Message */}
          {state?.error && (
            <div className="bg-rose-50 border border-rose-200/90 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{state.error}</span>
            </div>
          )}

          {/* Success Message */}
          {state?.success && (
            <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-3.5 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Reset link sent!</p>
                <p className="leading-relaxed text-emerald-700">
                  Please check your inbox (and spam folder) for instructions to reset your password.
                </p>
              </div>
            </div>
          )}

          {!state?.success ? (
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="forgot-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="pl-10 h-11 text-xs sm:text-sm bg-slate-50/70 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#006B3C] hover:bg-[#004d2b] text-white font-bold rounded-xl shadow-md shadow-[#006B3C]/20 active:scale-[0.99] transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending Link...</span>
                    </div>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-10 text-xs text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
