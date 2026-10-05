'use server'

import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
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
    .select('role, account_status, student_no')
    .eq('id', authData.user.id)
    .single()

  const actualRole = profile?.role || 'member'
  const status = profile?.account_status || 'pending'

  // Verify role permissions
  if (requestedRole === 'admin' && actualRole !== 'admin') {
    await supabase.auth.signOut()
    return { 
      error: 'You do not have administrator privileges.' 
    }
  }

  if (requestedRole !== 'admin' && actualRole === 'admin') {
    await supabase.auth.signOut()
    return { 
      error: 'Administrator accounts must sign in through the Administrator Portal.' 
    }
  }

  if (requestedRole === 'officer' && actualRole !== 'officer') {
    await supabase.auth.signOut()
    return { 
      error: 'You do not have officer privileges.' 
    }
  }

  (await cookies()).set('active_role', requestedRole, { path: '/' })

  // Ensure member profiles are complete before proceeding
  if (actualRole === 'member' && !profile?.student_no) {
    redirect('/complete-profile')
  }

  if (status === 'pending') {
    redirect('/pending')
  } else if (actualRole === 'admin') {
    redirect('/admin/verification')
  } else if (requestedRole === 'officer') {
    redirect('/scanner')
  } else {
    redirect('/dashboard')
  }
}

export async function logout(redirectTo: string = '/') {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(redirectTo)
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
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const origin = headersList.get('origin') || (host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))

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

  redirect('/complete-profile')
}

import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email'

export async function requestPasswordReset(prevState: any, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  if (!email) {
    return { error: 'Please enter your registered email address.' }
  }

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const origin = headersList.get('origin') || (host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  const redirectTo = `${origin}/reset-password`

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  // If Resend API Key and Service Role Key are configured, send custom-branded email directly
  if (process.env.RESEND_API_KEY && serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const adminSupabase = createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
      const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo,
        },
      })

      if (!linkError && linkData?.properties?.action_link) {
        const { data: profile } = await adminSupabase
          .from('users')
          .select('full_name, first_name')
          .eq('email', email)
          .maybeSingle()

        const name = profile?.first_name || profile?.full_name?.split(' ')[0] || undefined
        await sendPasswordResetEmail(email, linkData.properties.action_link, name)

        return {
          success: 'Password reset link sent! Please check your email inbox and spam folder.'
        }
      }
    } catch (e) {
      console.warn('Failed custom email dispatch, falling back to Supabase mailer:', e)
    }
  }

  // Fallback to clean standalone Supabase client (avoids SSR cookie interference)
  try {
    const supabase = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      console.error('Password Reset Error Details:', error)
      const errorMsg = error.message || 'An error occurred while requesting password reset'
      if (errorMsg.toLowerCase().includes('rate limit')) {
        return { error: 'Too many requests. Please wait a minute before requesting another reset link.' }
      }
      if (errorMsg.toLowerCase().includes('fetch failed')) {
        return { error: 'Unable to reach the authentication service. Please check your internet connection and try again.' }
      }
      return { error: errorMsg }
    }

    return {
      success: 'Password reset link sent! Please check your email inbox and spam folder.'
    }
  } catch (err: any) {
    console.error('Password Reset Unexpected Error:', err)
    return {
      error: 'Unable to send reset password link at this time. Please try again in a few moments.'
    }
  }
}

export async function updatePassword(prevState: any, formData: FormData): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password.length < 6) {
    return { error: 'New password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Update Password Error Details:', error)
    return { error: error.message }
  }

  // Sign out after reset to ensure clean re-authentication with new credentials
  await supabase.auth.signOut()
  redirect('/?reset=success')
}
