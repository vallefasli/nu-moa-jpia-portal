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

  const isAuthRoute = path === '/' || path.startsWith('/admin-login')
  const isPublicRoute = path.startsWith('/auth/callback') || path.startsWith('/confirmed') || path.startsWith('/privacy') || path.startsWith('/terms') || path.startsWith('/rejected') || path.startsWith('/reset-password')

  // Allow public routes through without any checks
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Auth routes should redirect to the correct portal if already logged in
  if (isAuthRoute) {
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, student_no, account_status')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'member' && !profile?.student_no) {
        return NextResponse.redirect(new URL('/complete-profile', request.url))
      }

      const activeRole = request.cookies.get('active_role')?.value;
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/verification', request.url))
      } else if (profile?.role === 'officer' && activeRole !== 'member') {
        return NextResponse.redirect(new URL('/scanner', request.url))
      }

      if (profile?.account_status === 'pending') {
        return NextResponse.redirect(new URL('/pending', request.url))
      }
      if (profile?.account_status === 'rejected') {
        return NextResponse.redirect(new URL('/rejected', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // --- All routes below require authentication ---
  if (!user) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // --- User is authenticated. Single profile query for all subsequent checks ---
  const { data: profile } = await supabase
    .from('users')
    .select('role, student_no, account_status')
    .eq('id', user.id)
    .single()

  // Enforce profile completion for members on all protected routes
  if (profile?.role === 'member' && !profile?.student_no && !path.startsWith('/complete-profile')) {
    return NextResponse.redirect(new URL('/complete-profile', request.url))
  }

  // Prevent users with completed profiles from accessing /complete-profile
  if (path.startsWith('/complete-profile') && profile?.student_no) {
    if (profile.account_status === 'active') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/pending', request.url))
  }

  // Protect /admin routes from non-admin users
  if (path.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      if (profile?.role === 'officer') {
        return NextResponse.redirect(new URL('/scanner', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}
