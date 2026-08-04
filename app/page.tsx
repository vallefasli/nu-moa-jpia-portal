'use client'

import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useActionState, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { signInWithOAuth } from '@/app/(auth)/actions'

function LoginForm({ role }: { role: string }) {
  const [state, formAction, isPending] = useActionState(login, null)
  
  return (
    <form action={formAction} className="space-y-4 mt-4">
      <input type="hidden" name="login_role" value={role} />
      
      {state?.error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`email-${role}`}>Email</Label>
        <Input id={`email-${role}`} name="email" type="email" placeholder="student@national-u.edu.ph" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`password-${role}`}>Password</Label>
        <Input id={`password-${role}`} name="password" type="password" required />
      </div>
      <Button className="w-full bg-[#35408e] hover:bg-[#28306e]" type="submit" disabled={isPending}>
        {isPending ? 'Signing In...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
      </Button>

      {role === 'member' && (
        <div className="pt-4 pb-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => signInWithOAuth('azure')}
              className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-5 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0001 10.0001H0V0H10.0001V10.0001Z" fill="#F25022"/>
                <path d="M21 10.0001H10.9999V0H21V10.0001Z" fill="#7FBA00"/>
                <path d="M10.0001 21H0V10.9999H10.0001V21Z" fill="#00A4EF"/>
                <path d="M21 21H10.9999V10.9999H21V21Z" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => signInWithOAuth('google')}
              className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-5 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                <path d="M5.50253 14.3003C5.00015 12.8099 5.00015 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
                <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      )}
    </form>
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
              Don't have an account?{' '}
              <Link href="/register" className="text-[#fbb03b] font-medium hover:underline">
                Sign up
              </Link>
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
