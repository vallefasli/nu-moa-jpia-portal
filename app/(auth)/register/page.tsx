'use client'

import { signup } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsPending(false)
      return
    }

    try {
      const result = await signup(null, formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.redirect) {
        router.push(result.redirect)
      } else if (result?.success) {
        setIsSuccess(true)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsPending(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 py-12">
        <Card className="w-full max-w-md border-t-4 border-t-green-500">
          <CardHeader className="space-y-4">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Registration Submitted</CardTitle>
            <CardDescription className="text-center text-base">
              We've sent a verification link to your email. You must verify your email and wait for an admin to approve your account before you can log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Link href="/" className="w-full">
              <Button className="w-full bg-[#35408e] hover:bg-[#28306e]">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-100">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" required placeholder="Juan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" required placeholder="Dela Cruz" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                <Input id="middle_name" name="middle_name" placeholder="Reyes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_no">Student Number</Label>
                <Input id="student_no" name="student_no" required placeholder="2021-123456" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <select 
                  id="program" 
                  name="program" 
                  required 
                  defaultValue=""
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Program</option>
                  <option value="BS Accountancy">BS Accountancy</option>
                  <option value="BS Management Accounting">BS Management Accounting</option>
                  <option value="BS Business Administration">BS Business Administration</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_level">Year Level</Label>
                <select 
                  id="year_level" 
                  name="year_level" 
                  required 
                  defaultValue=""
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Irregular">Irregular / Extended</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="committee">Committee (Optional)</Label>
              <select 
                id="committee" 
                name="committee" 
                defaultValue="None"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="None">None (General Member)</option>
                <option value="Academics">Academics</option>
                <option value="Non-Academics">Non-Academics</option>
                <option value="Membership">Membership</option>
                <option value="Finance">Finance</option>
                <option value="Audit">Audit</option>
                <option value="Communications">Communications</option>
                <option value="Creatives">Creatives</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="student@national-u.edu.ph" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirm_password" 
                  name="confirm_password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
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
