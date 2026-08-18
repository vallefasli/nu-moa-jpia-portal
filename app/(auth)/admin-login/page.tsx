'use client'

import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

function LoginForm({ role }: { role: string }) {
  const [state, formAction, isPending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="login_role" value={role} />
      
      {state?.error && (
        <div className="bg-rose-50 border border-rose-200/90 text-rose-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-relaxed font-medium">{state.error}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label 
          htmlFor={`email-${role}`} 
          className="text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Administrator Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <Input 
            id={`email-${role}`} 
            name="email" 
            type="email" 
            placeholder="admin@domain.com" 
            required 
            className="pl-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label 
          htmlFor={`password-${role}`} 
          className="text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <Input 
            id={`password-${role}`} 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••"
            required 
            className="pl-10 pr-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
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
      </div>

      {/* Submit Button */}
      <Button 
        className="w-full h-11 sm:h-12 bg-[#35408e] hover:bg-[#2a3370] text-white font-semibold rounded-xl shadow-md shadow-[#35408e]/20 active:scale-[0.99] transition-all cursor-pointer text-sm" 
        type="submit" 
        disabled={isPending}
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Verifying Credentials...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Sign In to Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>
    </form>
  )
}

function AuthStateSync() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session Expired', {
        description: 'You have been logged out due to inactivity.'
      })
      window.history.replaceState({}, '', '/admin-login')
    }
  }, [searchParams])

  return null
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/70 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#35408e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#fbb03b]/8 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={null}>
        <AuthStateSync />
      </Suspense>

      {/* Main Content Area */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#35408e] to-[#1e2452] flex items-center justify-center text-white shadow-lg shadow-[#35408e]/25 ring-4 ring-[#35408e]/10 mb-3">
            <ShieldCheck className="w-6 h-6 text-[#fbb03b]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Authorized Personnel Only
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white border border-slate-200/80 shadow-xl shadow-slate-900/[0.04] rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all">
          <LoginForm role="admin" />
        </div>

        {/* Return to Main Portal */}
        <div className="mt-4 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#35408e] hover:text-[#252d6a] hover:underline transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Member Portal</span>
          </Link>
        </div>

        {/* Minimalist Footer */}
        <div className="mt-5 text-center text-xs text-slate-400 space-y-1.5">
          <div className="space-x-3 text-[12px]">
            <Link href="/privacy" className="hover:text-slate-600 hover:underline transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/terms" className="hover:text-slate-600 hover:underline transition-colors">Terms and Conditions</Link>
          </div>
          <p className="text-[11px] text-slate-400/80">
            {`© ${new Date().getFullYear()} National University MOA • Junior Philippine Institute of Accountants`}
          </p>
        </div>
      </div>
    </div>
  )
}
