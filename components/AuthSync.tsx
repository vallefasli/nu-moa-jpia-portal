'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function AuthSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Create a BroadcastChannel to communicate across tabs
    const channel = new BroadcastChannel('auth-sync-channel')

    const handleSignOutRedirect = () => {
      const skipSync = localStorage.getItem('skip_auth_sync') === 'true'
      if (skipSync) {
        localStorage.removeItem('skip_auth_sync')
        return
      }
      const path = window.location.pathname
      const isExcluded = 
        path === '/' ||
        path === '/pending' ||
        path === '/rejected' ||
        path === '/confirmed' ||
        path.startsWith('/admin-login') ||
        path.startsWith('/auth/callback') ||
        path.startsWith('/privacy') ||
        path.startsWith('/terms')

      if (isExcluded) {
        return
      }

      const isAdmin = path.startsWith('/admin')
      const isExpired = localStorage.getItem('nu_moa_expired') === 'true'
      if (isExpired) {
        localStorage.removeItem('nu_moa_expired')
        window.location.href = isAdmin ? '/admin-login?expired=true' : '/?expired=true'
      } else {
        window.location.href = isAdmin ? '/admin-login' : '/'
      }
    }

    // Listen for auth changes triggered from other tabs
    channel.onmessage = (event) => {
      if (event.data?.type === 'AUTH_CHANGE') {
        // Never auto-refresh landing page if another tab is doing password reset
        if (event.data.from === '/reset-password' || event.data.isRecovery) {
          return
        }
        router.refresh()
        if (event.data.event === 'SIGNED_OUT') {
          setTimeout(handleSignOutRedirect, 100)
        }
      }
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Do not broadcast login events from the password reset page or recovery flows
      if (typeof window !== 'undefined' && window.location.pathname === '/reset-password') {
        return
      }
      if (event === 'PASSWORD_RECOVERY') {
        return
      }

      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Broadcast the event to other tabs
        channel.postMessage({ 
          type: 'AUTH_CHANGE', 
          event, 
          from: typeof window !== 'undefined' ? window.location.pathname : '',
          isRecovery: (event as string) === 'PASSWORD_RECOVERY'
        })

        // Handle it locally as well
        if (event === 'SIGNED_OUT') {
          router.refresh()
          setTimeout(handleSignOutRedirect, 100)
        } else {
          router.refresh()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      channel.close()
    }
  }, [router])

  return null
}
