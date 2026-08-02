'use client'

import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { useActionState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

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
        <Input id={`email-${role}`} name="email" type="email" placeholder="admin@domain.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`password-${role}`}>Password</Label>
        <Input id={`password-${role}`} name="password" type="password" required />
      </div>
      <Button className="w-full bg-[#35408e] hover:bg-[#28306e]" type="submit" disabled={isPending}>
        {isPending ? 'Signing In...' : `Sign In as Administrator`}
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={null}>
        <AuthStateSync />
      </Suspense>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Administrator Portal</CardTitle>
          <CardDescription className="text-center">
            Restricted area. Authorized personnel only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <LoginForm role="admin" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500 text-center w-full">
            Not an administrator?{' '}
            <Link href="/" className="text-[#35408e] font-medium hover:underline">
              Return to main portal
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
