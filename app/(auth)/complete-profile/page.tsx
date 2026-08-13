'use client'

import { useActionState, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { completeProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CompleteProfilePage() {
  const [state, formAction, isPending] = useActionState(completeProfile, null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [studentNo, setStudentNo] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [committee, setCommittee] = useState('None')

  useEffect(() => {
    if (state?.error) {
      const err = state.error.toLowerCase()
      if (err.includes('student email')) {
        setStudentEmail('')
      }
      if (err.includes('student number')) {
        setStudentNo('')
      }
    }
  }, [state])

  useEffect(() => {
    async function fetchName() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profile?.full_name && profile.full_name !== 'System Account') {
          const parts = profile.full_name.trim().split(' ')
          if (parts.length > 1) {
            setLastName(parts.pop() || '')
            setFirstName(parts.join(' '))
          } else {
            setFirstName(profile.full_name)
          }
        }
      }
    }
    fetchName()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-8">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-[#35408e]">
        <CardHeader className="space-y-1 pb-6 pt-8">
          <CardTitle className="text-3xl font-bold text-center text-[#35408e]">Complete Your Profile</CardTitle>
          <CardDescription className="text-center text-base">
            You're almost there! We just need a few more details to set up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8 px-2 sm:px-6 pb-6">
            {state?.error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100 flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {state.error}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[#35408e] uppercase tracking-wider border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                  <Input id="first_name" name="first_name" placeholder="e.g. Juan" required value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="last_name" name="last_name" placeholder="e.g. Dela Cruz" required value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <Input id="middle_name" name="middle_name" placeholder="e.g. Santos" value={middleName} onChange={e => setMiddleName(e.target.value)} className="bg-white" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="student_no">Student Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="student_no" 
                    name="student_no" 
                    placeholder="e.g. 2024-123456" 
                    required 
                    value={studentNo}
                    onChange={e => setStudentNo(e.target.value)}
                    pattern="^\d{4}-\d{6}$"
                    title="Format: 202X-XXXXXX"
                    className="bg-white"
                  />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="student_email">Student Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="student_email" 
                    name="student_email" 
                    type="email"
                    placeholder="e.g. juan@students.nu-moa.edu.ph" 
                    required 
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    pattern="^[a-zA-Z0-9._%+-]+@students\.nu-moa\.edu\.ph$"
                    title="Must be a valid @students.nu-moa.edu.ph email address"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Academic Information */}
            <div className="space-y-5 pt-2">
              <h3 className="text-sm font-semibold text-[#35408e] uppercase tracking-wider border-b pb-2">Academic & Organization</h3>
              
              <div className="space-y-2">
                <Label htmlFor="program">Program <span className="text-red-500">*</span></Label>
                <select 
                  id="program" 
                  name="program" 
                  required 
                  value={program}
                  onChange={e => setProgram(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select your Program</option>
                  <option value="BS Accountancy">BS Accountancy</option>
                  <option value="BS Management Accounting">BS Management Accounting</option>
                  <option value="BS Business Administration">BS Business Administration</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="year_level">Year Level <span className="text-red-500">*</span></Label>
                  <select 
                    id="year_level" 
                    name="year_level" 
                    required 
                    value={yearLevel}
                    onChange={e => setYearLevel(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <Label htmlFor="committee">Committee <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <select 
                    id="committee" 
                    name="committee" 
                    required 
                    value={committee}
                    onChange={e => setCommittee(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              </div>
            </div>

            <div className="pt-6 border-t mt-4">
              <div className="flex flex-row items-center space-x-3 bg-[#35408e]/5 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  className="h-5 w-5 rounded border-gray-300 text-[#35408e] focus:ring-[#35408e] cursor-pointer flex-shrink-0"
                />
                <Label htmlFor="terms" className="block text-sm text-gray-600 font-normal cursor-pointer leading-snug">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-[#35408e] font-medium hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-[#35408e] font-medium hover:underline">
                    Privacy Policy
                  </a>. I understand that my information will be used for organizational purposes only.
                </Label>
              </div>
            </div>

            <Button className="w-full bg-[#35408e] hover:bg-[#28306e] py-6 text-lg rounded-xl shadow-md transition-all active:scale-[0.98]" type="submit" disabled={isPending}>
              {isPending ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Profile...</span>
                </div>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
