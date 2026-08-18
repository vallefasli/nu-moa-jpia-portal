'use client'

import { useActionState, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { completeProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  UserCheck, 
  User, 
  Mail, 
  CreditCard, 
  GraduationCap, 
  Calendar, 
  Users, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

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
  const isHydrated = useRef(false)

  const [userId, setUserId] = useState<string | null>(null)

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
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      
      const storageKey = `cp_formState_${user.id}`
      const stored = sessionStorage.getItem(storageKey)
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.firstName) setFirstName(parsed.firstName)
          if (parsed.lastName) setLastName(parsed.lastName)
          if (parsed.middleName) setMiddleName(parsed.middleName)
          if (parsed.studentNo) setStudentNo(parsed.studentNo)
          if (parsed.studentEmail) setStudentEmail(parsed.studentEmail)
          if (parsed.program) setProgram(parsed.program)
          if (parsed.yearLevel) setYearLevel(parsed.yearLevel)
          if (parsed.committee) setCommittee(parsed.committee)
        } catch (e) {}
      } else {
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
      isHydrated.current = true
    }
    
    init()
  }, [])

  useEffect(() => {
    if (isHydrated.current && userId) {
      sessionStorage.setItem(`cp_formState_${userId}`, JSON.stringify({
        firstName, lastName, middleName, studentNo, studentEmail, program, yearLevel, committee
      }))
    }
  }, [firstName, lastName, middleName, studentNo, studentEmail, program, yearLevel, committee, userId])

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-slate-50/70 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#35408e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#fbb03b]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="w-full max-w-2xl my-auto flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#35408e] to-[#202758] flex items-center justify-center text-white shadow-lg shadow-[#35408e]/20 ring-4 ring-[#35408e]/10 mb-3">
            <UserCheck className="w-6 h-6 text-[#fbb03b]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Step 2 of 2 &bull; Student Details
          </p>
        </div>

        {/* Profile Card */}
        <div className="w-full bg-white border border-slate-200/80 shadow-xl shadow-slate-900/[0.04] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 transition-all">
          <form action={formAction} className="space-y-6 sm:space-y-8">
            {/* Error Notification */}
            {state?.error && (
              <div className="bg-rose-50 border border-rose-200/90 text-rose-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{state.error}</span>
              </div>
            )}

            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-[#35408e]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Personal Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* First Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    id="first_name" 
                    name="first_name" 
                    placeholder="e.g. Juan" 
                    required 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
                  />
                </div>
                
                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Last Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    id="last_name" 
                    name="last_name" 
                    placeholder="e.g. Dela Cruz" 
                    required 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
                  />
                </div>
                
                {/* Middle Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="middle_name" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Middle Name <span className="text-slate-400 font-normal text-[11px] lowercase">(optional)</span>
                  </Label>
                  <Input 
                    id="middle_name" 
                    name="middle_name" 
                    placeholder="e.g. Santos" 
                    value={middleName} 
                    onChange={e => setMiddleName(e.target.value)} 
                    className="h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
                  />
                </div>
                
                {/* Student Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="student_no" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Student Number <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <Input 
                      id="student_no" 
                      name="student_no" 
                      placeholder="2024-1234567" 
                      required 
                      value={studentNo}
                      onChange={e => setStudentNo(e.target.value)}
                      pattern="^\d{4}-\d{6,7}$"
                      title="Format: 202X-XXXXXX or 202X-XXXXXXX (e.g. 2024-1234567)"
                      className="pl-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all font-mono"
                    />
                  </div>
                </div>
                
                {/* Student Email */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="student_email" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Institutional Student Email <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input 
                      id="student_email" 
                      name="student_email" 
                      type="email"
                      placeholder="student@students.nu-moa.edu.ph" 
                      required 
                      value={studentEmail}
                      onChange={e => setStudentEmail(e.target.value)}
                      pattern="^[a-zA-Z0-9._%+-]+@students\.nu-moa\.edu\.ph$"
                      title="Must be a valid @students.nu-moa.edu.ph email address"
                      className="pl-10 h-11 text-sm bg-slate-50/60 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section 2: Academic & Organization */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-[#35408e]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Academic & Organization
                </h2>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="program" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Program / Degree <span className="text-rose-500">*</span>
                </Label>
                <select 
                  id="program" 
                  name="program" 
                  required 
                  value={program}
                  onChange={e => setProgram(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-sm text-slate-900 transition-all focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Select your academic program</option>
                  <option value="BS Accountancy">BS Accountancy</option>
                  <option value="BS Management Accounting">BS Management Accounting</option>
                  <option value="BS Business Administration">BS Business Administration</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="year_level" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Year Level <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    id="year_level" 
                    name="year_level" 
                    required 
                    value={yearLevel}
                    onChange={e => setYearLevel(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-sm text-slate-900 transition-all focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select year level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Extended Year">Extended Year</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="committee" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Committee <span className="text-slate-400 font-normal text-[11px] lowercase">(optional)</span>
                  </Label>
                  <select 
                    id="committee" 
                    name="committee" 
                    required 
                    value={committee}
                    onChange={e => setCommittee(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-sm text-slate-900 transition-all focus:bg-white focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 focus:outline-none cursor-pointer"
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

            {/* Terms and Privacy Checkbox */}
            <div className="pt-1">
              <div className="flex items-start gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#35408e] focus:ring-[#35408e] cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="block text-xs text-slate-600 leading-relaxed cursor-pointer font-normal">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#35408e] font-semibold hover:underline" target="_blank">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#35408e] font-semibold hover:underline" target="_blank">
                    Privacy Policy
                  </Link>. I understand that my information will be used for organizational purposes only.
                </label>
              </div>
            </div>

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
                  <span>Saving Profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Complete Profile & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Minimalist Footer */}
        <div className="mt-5 text-center text-xs text-slate-400">
          <p className="text-[11px] text-slate-400/80">
            {`© ${new Date().getFullYear()} National University MOA • Junior Philippine Institute of Accountants`}
          </p>
        </div>
      </div>
    </div>
  )
}
