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

  const isAuthRoute = path === '/' || path.startsWith('/register') || path.startsWith('/verify') || path.startsWith('/admin-login')
  const isPublicRoute = path.startsWith('/auth/confirm') || path.startsWith('/confirmed')

  // Auth routes should redirect to dashboard if already logged in
  if (isAuthRoute) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // If no user and not an auth route or public route, redirect to login
  if (!user && !isAuthRoute && !isPublicRoute) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
