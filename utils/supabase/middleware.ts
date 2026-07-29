import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Auth routes should redirect to dashboard if already logged in
  if (path === '/' || path.startsWith('/register')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // If no user and not an auth route, redirect to login
  if (!user && path !== '/' && !path.startsWith('/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user) {
    // Fetch custom user profile to check role and status
    const { data: profile } = await supabase
      .from('users')
      .select('role, account_status')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'member'
    const status = profile?.account_status || 'pending'

    // Restrict pending users
    if (status === 'pending' && path !== '/pending') {
      return NextResponse.redirect(new URL('/pending', request.url))
    }
    if (status === 'active' && path === '/pending') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Restrict admin routes
    if (path.startsWith('/admin')) {
      if (role === 'admin') {
        // Admins can access anything in /admin
      } else if (role === 'officer' && path.startsWith('/admin/scanner')) {
        // Officers can ONLY access the scanner
      } else {
        // Everyone else gets booted
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}
