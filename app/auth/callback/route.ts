import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const loginRole = searchParams.get('login_role')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`)
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
        return NextResponse.redirect(`${origin}/complete-profile`)
      }

      console.log('Profile complete, redirecting to app')
      
      // Verify role permissions if they requested to log in as an officer
      if (loginRole === 'officer' && profile.role !== 'officer' && profile.role !== 'admin') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/?error=not_officer&tab=officer`)
      }
      
      let redirectPath = next
      if (profile.account_status === 'pending') redirectPath = '/pending'
      else if (profile.role === 'admin') redirectPath = '/admin/verification'
      else if (profile.role === 'officer') redirectPath = '/scanner'

      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalhost = process.env.NODE_ENV === 'development'
      
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  } else {
    console.error('No code found in URL params')
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
