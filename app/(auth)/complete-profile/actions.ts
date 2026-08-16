'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function completeProfile(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated. Please log in first.' }
  }

  const first_name = formData.get('first_name') as string
  const middle_name = formData.get('middle_name') as string
  const last_name = formData.get('last_name') as string
  
  // Clean up and combine names, ignoring empty middle names
  const full_name = [first_name, middle_name, last_name]
    .filter(n => n && n.trim().length > 0)
    .map(n => n.trim())
    .join(' ')
    
  const student_no = formData.get('student_no') as string
  const program = formData.get('program') as string
  const year_level = formData.get('year_level') as string
  const committee = formData.get('committee') as string
  const student_email = formData.get('student_email') as string

  if (!student_email.endsWith('@students.nu-moa.edu.ph')) {
    return { error: 'Student Email must end with @students.nu-moa.edu.ph' }
  }

  // Update public.users table
  const { error } = await supabase
    .from('users')
    .update({
      full_name,
      first_name,
      middle_name,
      last_name,
      student_no,
      student_email,
      program,
      year_level,
      committee
    })
    .eq('id', user.id)

  if (error) {
    const errorString = (error.message || error.details || '').toLowerCase()
    
    if (errorString.includes('student_email')) {
      return { error: 'This Student Email is already registered to another account.' }
    }
    
    if (errorString.includes('student_no')) {
      return { error: 'This Student Number is already registered to another account.' }
    }
    
    return { error: error.message }
  }

  // Check the account_status
  const { data: profile } = await supabase
    .from('users')
    .select('account_status, role')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')

  if (profile?.account_status === 'pending') {
    redirect('/pending')
  } else {
    redirect('/dashboard')
  }
}
