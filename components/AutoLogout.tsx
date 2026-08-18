'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const STORAGE_KEY = 'nu_moa_last_activity'

export function AutoLogout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const performLogout = useCallback(async () => {
    // Clear storage to prevent loops
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem('nu_moa_expired', 'true')
    
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
    const redirectUrl = isAdmin ? '/admin-login?expired=true' : '/?expired=true'
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('AutoLogout signout error:', err)
    } finally {
      window.location.href = redirectUrl
    }
  }, [])

  const resetTimer = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => performLogout(), INACTIVITY_TIMEOUT)
  }, [performLogout])

  useEffect(() => {
    // Check on mount if we're already expired from a previous session
    const lastActivity = localStorage.getItem(STORAGE_KEY)
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10)
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        performLogout()
        return
      }
    }

    // Set up listeners for activity
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const last = localStorage.getItem(STORAGE_KEY)
        if (last && (Date.now() - parseInt(last, 10) > INACTIVITY_TIMEOUT)) {
          performLogout()
        } else {
          resetTimer()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    resetTimer()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [resetTimer, performLogout])

  return null
}
