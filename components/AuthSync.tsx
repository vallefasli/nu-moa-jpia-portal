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

    // Listen for auth changes triggered from other tabs
    channel.onmessage = (event) => {
      if (event.data.type === 'AUTH_CHANGE') {
        router.refresh()
        if (event.data.event === 'SIGNED_OUT') {
          setTimeout(() => {
            const skipSync = localStorage.getItem('skip_auth_sync') === 'true'
            if (skipSync) {
              localStorage.removeItem('skip_auth_sync')
              return
            }
            if (window.location.pathname === '/pending') {
              return
            }
            const isExpired = localStorage.getItem('nu_moa_expired') === 'true'
            if (isExpired) {
              localStorage.removeItem('nu_moa_expired')
              window.location.href = '/?expired=true'
            } else {
              if (window.location.pathname !== '/rejected') {
                window.location.href = '/'
              }
            }
          }, 100)
        }
      }
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Broadcast the event to other tabs
        channel.postMessage({ type: 'AUTH_CHANGE', event })

        // Handle it locally as well
        if (event === 'SIGNED_OUT') {
          router.refresh()
          setTimeout(() => {
            const skipSync = localStorage.getItem('skip_auth_sync') === 'true'
            if (skipSync) {
              localStorage.removeItem('skip_auth_sync')
              return
            }
            if (window.location.pathname === '/pending') {
              return
            }
            const isExpired = localStorage.getItem('nu_moa_expired') === 'true'
            if (isExpired) {
              localStorage.removeItem('nu_moa_expired')
              window.location.href = '/?expired=true'
            } else {
              if (window.location.pathname !== '/rejected') {
                window.location.href = '/'
              }
            }
          }, 100)
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
