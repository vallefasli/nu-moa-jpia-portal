'use client'

import { signup } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, Suspense, useEffect } from 'react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.redirect) {
      router.push(state.redirect)
    }
  }, [state?.redirect, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join the NU MOA JPIA Membership Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-100">
                {state.error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" required placeholder="Juan Dela Cruz" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_no">Student Number</Label>
                <Input id="student_no" name="student_no" required placeholder="2021-123456" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input id="program" name="program" required placeholder="BS Accountancy" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_level">Year Level</Label>
                <Input id="year_level" name="year_level" required placeholder="3rd Year" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="committee">Committee (Optional)</Label>
              <Input id="committee" name="committee" placeholder="e.g. Academics" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="student@national-u.edu.ph" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            
            <Button className="w-full mt-4 bg-[#35408e] hover:bg-[#28306e]" type="submit" disabled={isPending}>
              {isPending ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500 text-center w-full">
            Already have an account?{' '}
            <Link href="/login" className="text-[#fbb03b] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
