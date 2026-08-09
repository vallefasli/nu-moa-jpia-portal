'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleRSVP } from './actions'
import { toast } from 'sonner'
import { Check, UserPlus } from 'lucide-react'

export function RSVPButton({ eventId, initialIsRSVPd, disabled = false }: { eventId: string, initialIsRSVPd: boolean, disabled?: boolean }) {
  const [isRSVPd, setIsRSVPd] = useState(initialIsRSVPd)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    // Optimistic update
    const newValue = !isRSVPd
    setIsRSVPd(newValue)
    
    startTransition(async () => {
      const res = await toggleRSVP(eventId, !newValue)
      if (res?.error) {
        toast.error(res.error)
        setIsRSVPd(!newValue) // revert
      } else {
        toast.success(newValue ? "You've RSVP'd!" : "RSVP canceled")
      }
    })
  }

  return (
    <Button 
      size="sm" 
      disabled={disabled || isPending}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        handleToggle()
      }}
      className={`rounded-full px-4 h-8 text-xs font-bold transition-all shadow-sm ${
        isRSVPd 
          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200' 
          : 'bg-[#35408e] text-white hover:bg-[#2a3370]'
      }`}
    >
      {isRSVPd ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1.5" />
          Going
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          RSVP
        </>
      )}
    </Button>
  )
}
