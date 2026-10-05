'use client'

import { useState, useEffect } from 'react'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  GraduationCap
} from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)

  useEffect(() => {
    // Extract tokens from URL hash fragment (#access_token=...&refresh_token=...&type=recovery)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        setTokens({ accessToken, refreshToken })
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsPending(true)

    try {
      // Use an isolated client with persistSession: false so cookies & localStorage
      // are NEVER touched and other tabs (like the landing page) are not affected!
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      )

      if (tokens) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        })
        if (sessionError || !data.session) {
          setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.')
          setIsPending(false)
          return
        }
      }

      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        console.error('Update password error:', error)
        const msg = error.message || 'Failed to update password'
        if (msg.toLowerCase().includes('same password')) {
          setErrorMessage('New password must be different from your old password.')
        } else if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('not logged in')) {
          setErrorMessage('Your password reset link has expired or is invalid. Please request a new one.')
        } else {
          setErrorMessage(msg)
        }
        setIsPending(false)
        return
      }

      setSuccessMessage('Password reset successfully! Redirecting you to sign in...')

      setTimeout(() => {
        window.location.href = '/?reset=success'
      }, 1500)
    } catch (err: any) {
      console.error('Unexpected error resetting password:', err)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/70 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#006B3C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FFD54F]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006B3C] to-[#004d2b] flex items-center justify-center text-white shadow-lg shadow-[#006B3C]/20 ring-4 ring-[#006B3C]/10 mb-3">
            <GraduationCap className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter a strong new password for your JPIA portal account.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white border border-slate-200/80 shadow-xl shadow-slate-900/[0.04] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200/90 text-rose-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label 
                htmlFor="new-password" 
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                New Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  id="new-password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                  className="pl-10 pr-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Must be at least 6 characters.</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label 
                htmlFor="confirm-password" 
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  id="confirm-password" 
                  name="confirm_password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  minLength={6}
                  className="pl-10 pr-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#006B3C] focus:ring-2 focus:ring-[#006B3C]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full h-11 sm:h-12 bg-[#006B3C] hover:bg-[#004d2b] text-white font-semibold rounded-xl shadow-md shadow-[#006B3C]/20 active:scale-[0.99] transition-all cursor-pointer text-sm mt-2 flex items-center justify-center gap-2" 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Updating Password...</span>
                </div>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Return to Sign In */}
        <div className="mt-4 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006B3C] hover:text-[#004d2b] hover:underline transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1.5">
          <p className="text-[11px] text-slate-400/80">
            {`© ${new Date().getFullYear()} National University MOA • Junior Philippine Institute of Accountants`}
          </p>
        </div>
      </div>
    </div>
  )
}
