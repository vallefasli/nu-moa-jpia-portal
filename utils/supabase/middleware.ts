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
  const isPublicRoute = path.startsWith('/auth/callback') || path.startsWith('/confirmed') || path.startsWith('/privacy') || path.startsWith('/terms')

  // If the user is logged in, check if their profile is complete
  if (user) {
    // Only check the database if they are trying to access a protected route or auth route
    // to avoid unnecessary DB calls on public routes
    if (!isPublicRoute && !path.startsWith('/complete-profile')) {
      const { data: profile } = await supabase
        .from('users')
        .select('student_no, role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'member' && !profile?.student_no) {
        return NextResponse.redirect(new URL('/complete-profile', request.url))
      }
    }
  }

  // Auth routes should redirect to dashboard if already logged in (and profile is complete)
  if (isAuthRoute) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // If no user and not an auth route or public route, redirect to login
  if (!user && !isAuthRoute && !isPublicRoute && !path.startsWith('/complete-profile')) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
