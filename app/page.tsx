'use client'

import { login, signup } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

function LoginForm({ role }: { role: string }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loginState, loginAction, isLoginPending] = useActionState(login, null)
  const [signupState, signupAction, isSignupPending] = useActionState(signup, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const isSignupMode = role === 'member' && mode === 'signup'
  
  const state = isSignupMode ? signupState : loginState
  const formAction = isSignupMode ? signupAction : loginAction
  const isPending = isSignupMode ? isSignupPending : isLoginPending
  
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?login_role=${role}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  const handleMicrosoftLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email',
        redirectTo: `${window.location.origin}/auth/callback?login_role=${role}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  return (
    <div className="space-y-5">
      {/* Error Alert */}
      {state?.error && (
        <div className="bg-rose-50 border border-rose-200/90 text-rose-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-relaxed font-medium">{state.error}</span>
        </div>
      )}
      
      {/* Success Alert */}
      {state?.success && (
        <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span className="leading-relaxed font-medium">{state.success}</span>
        </div>
      )}

      {/* Role specific helper note */}
      {role === 'officer' && (
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 text-xs text-slate-700 flex items-center gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-[#35408e] shrink-0" />
          <p className="text-slate-600 font-medium">
            Officer accounts are assigned and managed by administrators.
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="login_role" value={role} />

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label 
            htmlFor={`email-${role}`} 
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Personal Email Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <Input 
              id={`email-${role}`} 
              name="email" 
              type="email" 
              placeholder="personal@gmail.com" 
              required 
              className="pl-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor={`password-${role}`} 
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Password
            </Label>
          </div>
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
        
        {/* Confirm Password (Member Signup only) */}
        {isSignupMode && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label 
              htmlFor={`confirm-password-${role}`} 
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input 
                id={`confirm-password-${role}`} 
                name="confirm_password" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                required 
                className="pl-10 pr-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
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
        )}

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
              <span>{!isSignupMode ? 'Signing In...' : 'Creating Account...'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{!isSignupMode ? `Sign In as ${role === 'officer' ? 'Officer' : 'Member'}` : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>
      
      {/* Social Auth Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
        </div>
      </div>
          
      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          type="button" 
          className="h-11 w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl text-xs sm:text-sm shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2" 
          onClick={handleGoogleLogin}
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </Button>

        <Button 
          variant="outline" 
          type="button" 
          className="h-11 w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl text-xs sm:text-sm shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2" 
          onClick={handleMicrosoftLogin}
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span>Microsoft</span>
        </Button>
      </div>
          
      {/* Mode Switch (Member Only) */}
      {role === 'member' && (
        <div className="pt-2 text-center text-xs text-slate-500">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-[#35408e] hover:text-[#252d6a] hover:underline transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      )}
    </div>
  )
}

function AuthStateSync({ setActiveRole }: { setActiveRole: (role: string) => void }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session Expired', {
        description: 'You have been signed out due to inactivity.'
      })
      window.history.replaceState({}, '', '/')
    }

    if (searchParams.get('error') === 'invalid_token') {
      toast.error('Invalid or Expired Link', {
        description: 'The confirmation link is invalid or was opened in a different browser. Please try signing up again if your account is not verified.'
      })
      window.history.replaceState({}, '', '/')
    }

    if (searchParams.get('error') === 'not_officer') {
      toast.error('Access Denied', {
        description: 'You do not have officer privileges.'
      })
      window.history.replaceState({}, '', '/?tab=officer')
    }

    const tab = searchParams.get('tab')
    if (tab && ['member', 'officer'].includes(tab)) {
      setActiveRole(tab)
    }
  }, [searchParams, setActiveRole])

  return null
}

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState('member')

  useEffect(() => {
    // Clear any lingering inactivity timestamps from previous sessions
    localStorage.removeItem('nu_moa_last_activity')
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/70 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#35408e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#fbb03b]/8 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={null}>
        <AuthStateSync setActiveRole={setActiveRole} />
      </Suspense>

      {/* Main Content Area */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#35408e] to-[#202758] flex items-center justify-center text-white shadow-lg shadow-[#35408e]/20 ring-4 ring-[#35408e]/10 mb-3">
            <GraduationCap className="w-6 h-6 text-[#fbb03b]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            NU MOA JPIA
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Membership Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white border border-slate-200/80 shadow-xl shadow-slate-900/[0.04] rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all">
          {/* Segmented Role Selector */}
          <div className="grid w-full grid-cols-2 bg-slate-100/80 p-1 rounded-xl sm:rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveRole('member')}
              className={`cursor-pointer flex items-center justify-center gap-2 rounded-lg sm:rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeRole === 'member'
                  ? 'bg-white text-[#35408e] shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeRole === 'member' ? 'text-[#35408e]' : 'text-slate-400'}`} />
              <span>Member</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('officer')}
              className={`cursor-pointer flex items-center justify-center gap-2 rounded-lg sm:rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeRole === 'officer'
                  ? 'bg-white text-[#35408e] shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeRole === 'officer' ? 'text-[#35408e]' : 'text-slate-400'}`} />
              <span>Officer</span>
            </button>
          </div>

          {/* Form */}
          <LoginForm role={activeRole} />
        </div>

        {/* Admin Portal Shortcut */}
        <div className="mt-3.5 text-center">
          <Link 
            href="/admin-login" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#35408e] transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Access</span>
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
