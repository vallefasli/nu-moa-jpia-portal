'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const requestedRole = formData.get('login_role') as string || 'member'
  const supabase = await createClient()

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Fetch role and status to redirect correctly
  const { data: profile } = await supabase
    .from('users')
    .select('role, account_status')
    .eq('id', authData.user.id)
    .single()

  const actualRole = profile?.role || 'member'
  const status = profile?.account_status || 'pending'

  // Verify the requested role strictly matches their actual role
  if (requestedRole !== actualRole) {
    await supabase.auth.signOut()
    return { 
      error: `Unauthorized: This account belongs to a ${actualRole.charAt(0).toUpperCase() + actualRole.slice(1)}. Please login using the ${actualRole.charAt(0).toUpperCase() + actualRole.slice(1)} tab.` 
    }
  }

  revalidatePath('/', 'layout')

  if (status === 'pending') {
    redirect('/pending')
  } else if (actualRole === 'admin') {
    redirect('/admin/verification')
  } else if (actualRole === 'officer') {
    redirect('/admin/scanner')
  } else {
    redirect('/dashboard')
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const student_no = formData.get('student_no') as string
  const program = formData.get('program') as string
  const year_level = formData.get('year_level') as string
  const committee = formData.get('committee') as string

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        student_no,
        program,
        year_level,
        committee,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session === null) {
    return { success: 'Registration successful! Please check your inbox and click the confirmation link before an admin can approve your account.' }
  }

  revalidatePath('/', 'layout')
  redirect('/pending')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
