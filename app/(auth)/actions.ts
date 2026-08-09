'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please check your email and click the verification link before logging in.' }
    }
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
      error: `Invalid login credentials for the ${requestedRole} portal.` 
    }
  }

  revalidatePath('/', 'layout')

  if (status === 'pending') {
    redirect('/pending')
  } else if (actualRole === 'admin') {
    redirect('/admin/verification')
  } else if (actualRole === 'officer') {
    redirect('/scanner')
  } else {
    redirect('/dashboard')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
