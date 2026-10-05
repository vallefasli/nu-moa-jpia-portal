import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | 'invite' | null
  const next = searchParams.get('next') ?? '/dashboard'
  const loginRole = searchParams.get('login_role')

  const forwardedHost = request.headers.get('x-forwarded-host') 
  const isLocalhost = process.env.NODE_ENV === 'development'
  const baseUrl = (isLocalhost || !forwardedHost) ? origin : `https://${forwardedHost}`

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      console.log('OAuth successful for user:', data.user.id)
      // Check if the user is missing required profile information
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('student_no, role, account_status')
        .eq('id', data.user.id)
        .single()
        
      if (profileError) {
         console.error('Profile fetch error:', profileError)
      }

      if (!profile?.student_no) {
        console.log('Missing student_no, redirecting to complete-profile')
        return NextResponse.redirect(`${baseUrl}/complete-profile`)
      }

      console.log('Profile complete, redirecting to app')
      
      // Admin accounts cannot sign in via public member/officer OAuth
      if (profile.role === 'admin') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${baseUrl}/?error=admin_account`)
      }

      // Verify role permissions if they requested to log in as an officer
      if (loginRole === 'officer' && profile.role !== 'officer') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${baseUrl}/?error=not_officer&tab=officer`)
      }
      
      let redirectPath = next
      if (profile.account_status === 'pending') {
        redirectPath = '/pending'
      } else if (profile.role === 'officer' && loginRole === 'officer') {
        redirectPath = '/scanner'
      } else {
        redirectPath = '/dashboard'
      }

      if (loginRole) {
        ;(await cookies()).set('active_role', loginRole, { path: '/' })
      }

      return NextResponse.redirect(`${baseUrl}${redirectPath}`)
    }
  } else if (token_hash) {
    // Handle email confirmation via token hash (manual signup flow)
    const supabase = await createClient()
    const otpType = (type || 'signup') as any
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: otpType })
    
    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.redirect(`${baseUrl}/?error=invalid_token`)
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('student_no, role, account_status')
        .eq('id', user.id)
        .single()
      
      if (!profile?.student_no) {
        return NextResponse.redirect(`${baseUrl}/complete-profile`)
      }
      
      if (profile.role === 'admin') {
        return NextResponse.redirect(`${baseUrl}/admin/verification`)
      }
      
      if (profile.account_status === 'pending') {
        return NextResponse.redirect(`${baseUrl}/pending`)
      }
      
      return NextResponse.redirect(`${baseUrl}${next || '/dashboard'}`)
    }
  } else {
    console.error('No code or token_hash found in URL params')
  }

  return NextResponse.redirect(`${baseUrl}/?error=auth_failed`)
}
