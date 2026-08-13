'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export type AuthState = {
  error?: string
  success?: string
} | null

export async function login(prevState: any, formData: FormData): Promise<AuthState> {
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

export async function signup(prevState: any, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup Error Details:', error)
    const errorMsg = error.message || String(error) || 'An unknown error occurred'
    if (errorMsg.toLowerCase().includes('rate limit')) {
      return { error: 'Our servers are currently busy (Rate Limit). Your account might have already been created successfully. Please wait a few minutes, then try logging in.' }
    }
    return { error: errorMsg }
  }

  if (data.session === null) {
    return { success: 'Registration successful! Please check your email and click the confirmation link to complete your setup.' }
  }

  revalidatePath('/', 'layout')
  redirect('/pending')
}
