'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function AuthSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If the auth state changes (e.g. from another tab), we need to refresh the router
      // so that Server Components can read the new cookies and re-render or redirect.
      if (event === 'SIGNED_OUT') {
        router.refresh()
        // Wait a small tick before redirecting to allow refresh to process
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
}
