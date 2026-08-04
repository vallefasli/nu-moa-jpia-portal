'use client'

import { useActionState, useState } from 'react'
import { completeOnboarding } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(completeOnboarding, null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 py-12">
      <Card className="w-full max-w-md border-t-4 border-t-[#35408e] shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Complete Your Profile</CardTitle>
          <CardDescription className="text-center text-base">
            Just a few more details to complete your NU MOA JPIA membership registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-start space-x-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{state.error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="student_no">Student Number</Label>
              <Input id="student_no" name="student_no" required placeholder="2021-123456" />
            </div>

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

            <Button className="w-full mt-4 bg-[#35408e] hover:bg-[#28306e] py-6" type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
