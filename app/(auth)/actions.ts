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

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
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

  const supabase = await createClient()

  // Pre-flight check: Ensure student number is unique
  // The database trigger will fail with a 500 error if we don't catch this early!
  const { data: existingStudent } = await supabase
    .from('users')
    .select('id')
    .eq('student_no', student_no)
    .single()

  if (existingStudent) {
    return { error: 'This Student Number is already registered.' }
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${protocol}://${host}/auth/confirm`,
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
    console.error('Signup Error Details:', error)
    
    let errorMsg = 'An unknown error occurred'
    if (error?.message) {
      errorMsg = error.message
    } else if (typeof error === 'string') {
      errorMsg = error
    } else if (error && typeof error === 'object') {
      errorMsg = (error as any).error_description || (error as any).msg || JSON.stringify(error)
    }

    if (errorMsg === '{}') {
      errorMsg = 'Server Error (500): This is often caused by invalid SMTP credentials in Supabase, or a failure to send the confirmation email. Please check your Supabase Auth settings.'
    }

    if (errorMsg.toLowerCase().includes('rate limit')) {
      return { error: 'Our servers are currently busy (Rate Limit). Your account might have already been created successfully. Please wait a few minutes, then try logging in.' }
    }
    return { error: errorMsg }
  }

  if (data.session === null) {
    return { success: true }
  }

  revalidatePath('/', 'layout')
  return { redirect: '/dashboard' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function verifyOtp(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('code') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup',
  })

  if (error) {
    return { error: 'Invalid or expired code. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/pending')
}

export async function confirmEmailToken(params: { code?: string | null; token_hash?: string | null; type?: string | null }) {
  const supabase = await createClient()

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    if (error) {
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { success: true }
  }

  if (params.token_hash && params.type) {
    const { error } = await supabase.auth.verifyOtp({
      type: params.type as any,
      token_hash: params.token_hash,
    })
    if (error) {
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { success: true }
  }

  return { error: 'Invalid or missing verification link parameters.' }
}

export async function resendConfirmationEmail(email: string) {
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${protocol}://${host}/auth/confirm`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('rate limit')) {
      return { error: 'Please wait a few minutes before requesting another verification email.' }
    }
    return { error: error.message }
  }

  return { success: true }
}

export async function signInWithOAuth(provider: 'google' | 'azure') {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  
  const redirectUrl = `${protocol}://${host}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function completeOnboarding(prevState: any, formData: FormData) {
  const student_no = formData.get('student_no') as string
  const program = formData.get('program') as string
  const year_level = formData.get('year_level') as string
  const committee = formData.get('committee') as string

  const supabase = await createClient()

  // First, verify student number is not taken
  const { data: existingStudent } = await supabase
    .from('users')
    .select('id')
    .eq('student_no', student_no)
    .single()

  if (existingStudent) {
    return { error: 'This Student Number is already registered.' }
  }

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  // Update user profile in public.users
  const { error: updateError } = await supabase
    .from('users')
    .update({
      student_no,
      program,
      year_level,
      committee,
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/', 'layout')
  return { redirect: '/dashboard' }
}
