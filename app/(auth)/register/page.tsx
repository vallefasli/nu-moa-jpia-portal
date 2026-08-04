'use client'

import { signup, resendConfirmationEmail } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, RefreshCw, Mail, CheckCircle2 } from 'lucide-react'
import { signInWithOAuth } from '@/app/(auth)/actions'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ text: string; isError?: boolean } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    setRegisteredEmail(email)

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

  async function handleResend() {
    if (!registeredEmail) return
    setIsResending(true)
    setResendMessage(null)
    try {
      const res = await resendConfirmationEmail(registeredEmail)
      if (res?.error) {
        setResendMessage({ text: res.error, isError: true })
      } else {
        setResendMessage({ text: 'A new verification email has been dispatched. Please check your inbox and Junk/Spam folder.', isError: false })
      }
    } catch (err) {
      setResendMessage({ text: 'Failed to resend confirmation email. Please try again.', isError: true })
    } finally {
      setIsResending(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 py-12">
        <Card className="w-full max-w-md border-t-4 border-t-[#fbb03b] shadow-lg">
          <CardHeader className="space-y-4">
            <div className="mx-auto bg-[#fbb03b]/20 p-4 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#d99730]" />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Registration Submitted</CardTitle>
            <CardDescription className="text-center text-base">
              We've sent a verification link to <span className="font-semibold text-gray-800">{registeredEmail}</span>. 
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3.5 text-xs text-blue-900 leading-relaxed">
              <p className="font-semibold mb-1">Important for University (.edu) Emails:</p>
              <p>Microsoft 365 Exchange often places automated verification emails in the <span className="font-bold underline">Junk / Spam</span> folder or holds them briefly. Please check your Junk folder if you do not see it in your Inbox.</p>
            </div>

            {resendMessage && (
              <div className={`p-3 rounded-md text-xs border ${resendMessage.isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {resendMessage.text}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              className="w-full border-gray-300 hover:bg-gray-50 text-sm font-medium py-5"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Resending Email...' : 'Resend Verification Email'}
            </Button>

            <Link href="/" className="w-full block pt-2">
              <Button className="w-full bg-[#35408e] hover:bg-[#28306e] py-5">
                Go to Login Page
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
          <div className="flex flex-col gap-2 mb-6">
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
              Sign up with Microsoft
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
              Sign up with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or register with email</span>
            </div>
          </div>

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
                  <option value="Extended Year">Extended Year</option>
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
