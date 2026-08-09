'use client'

import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

import { useActionState, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

function LoginForm({ role }: { role: string }) {
  const [state, formAction, isPending] = useActionState(login, null)
  
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  
  if (role === 'member') {
    return (
      <div className="space-y-4 mt-4">
        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
          Sign in with Google
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="login_role" value={role} />
        
        {state?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`email-${role}`}>Email</Label>
          <Input id={`email-${role}`} name="email" type="email" placeholder="officer@national-u.edu.ph" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`password-${role}`}>Password</Label>
          <Input id={`password-${role}`} name="password" type="password" required />
        </div>
        <Button className="w-full bg-[#35408e] hover:bg-[#28306e]" type="submit" disabled={isPending}>
          {isPending ? 'Signing In...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </Button>
      </form>
    </div>
  )
}

function AuthStateSync({ setActiveRole }: { setActiveRole: (role: string) => void }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session Expired', {
        description: 'You have been logged out due to inactivity.'
      })
      // Clean up the URL
      window.history.replaceState({}, '', '/')
    }

    if (searchParams.get('error') === 'invalid_token') {
      toast.error('Invalid or Expired Link', {
        description: 'The confirmation link is invalid or was opened in a different browser. Please try signing up again if your account is not verified.'
      })
      window.history.replaceState({}, '', '/')
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={null}>
        <AuthStateSync setActiveRole={setActiveRole} />
      </Suspense>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Select your role to sign in to the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg mb-4">
              {['member', 'officer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveRole(r);
                  }}
                  className={`relative z-50 cursor-pointer flex items-center justify-center rounded-md py-2 px-1 text-sm font-bold transition-all ${
                    activeRole === r 
                      ? 'bg-white text-[#35408e] shadow-md border-b-2 border-[#fbb03b]' 
                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            
            <LoginForm role={activeRole} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {activeRole === 'member' ? (
            <div className="text-sm text-gray-500 text-center w-full">
              Sign in securely using your Google account.
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center w-full bg-gray-100 p-2.5 rounded-md border border-gray-200">
              Officer accounts are managed by system administrators. Contact your admin for access.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
