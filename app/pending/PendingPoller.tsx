'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function PendingPoller() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        if (mounted) window.location.href = '/'
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        localStorage.setItem('skip_auth_sync', 'true')
        await supabase.auth.signOut()
        if (mounted) window.location.href = '/rejected'
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('account_status')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // user missing from DB
        localStorage.setItem('skip_auth_sync', 'true')
        await supabase.auth.signOut()
        window.location.href = '/rejected'
        return
      }

      if (profile.account_status === 'active') {
        window.location.href = '/accepted'
      } else if (profile.account_status === 'rejected') {
        localStorage.setItem('skip_auth_sync', 'true')
        await supabase.auth.signOut()
        window.location.href = '/rejected'
      }
    }

    // Check immediately
    checkStatus()

    // Poll every 5 seconds
    const interval = setInterval(checkStatus, 5000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [router])

  return null
}
