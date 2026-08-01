'use client'

import { verifyOtp } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { useActionState, Suspense } from 'react'

function VerifyForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  
  const [state, formAction, isPending] = useActionState(verifyOtp, null)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Verify Email</CardTitle>
        <CardDescription className="text-center">
          We sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          
          {state?.error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-100">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="code" className="text-center block">6-Digit Code</Label>
            <Input 
              id="code" 
              name="code" 
              required 
              placeholder="123456" 
              className="text-center text-2xl tracking-[0.5em] font-mono py-6"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>
          
          <Button className="w-full mt-4 bg-[#35408e] hover:bg-[#28306e]" type="submit" disabled={isPending}>
            {isPending ? 'Verifying...' : 'Verify Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  )
}
