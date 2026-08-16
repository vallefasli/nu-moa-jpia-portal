'use client'

import { Button } from '@/components/ui/button'
import { approveUser, rejectUser } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { useTransition } from 'react'

interface ActionButtonsProps {
  userId: string;
  className?: string;
  onSuccess?: () => void;
}

export function ActionButtons({ userId, className = '', onSuccess }: ActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        size="sm"
        variant="default"
        className="bg-green-600 hover:bg-green-700 h-8 flex-1 md:flex-none"
        disabled={isPending}
        onClick={(e) => {
          e.stopPropagation();
          startTransition(async () => {
            const res = await approveUser(userId)
            if (res.error) {
              toast.error(res.error)
            } else {
              toast.success('User approved successfully!')
              onSuccess?.()
            }
          })
        }}
      >
        <Check className="w-4 h-4 mr-1 md:mr-0 lg:mr-1" /> <span className="md:hidden lg:inline">Approve</span>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-8 flex-1 md:flex-none"
        disabled={isPending}
        onClick={(e) => {
          e.stopPropagation();
          startTransition(async () => {
            const res = await rejectUser(userId)
            if (res.error) {
              toast.error(res.error)
            } else {
              toast.success('User rejected.')
              onSuccess?.()
            }
          })
        }}
      >
        <X className="w-4 h-4 mr-1 md:mr-0 lg:mr-1" /> <span className="md:hidden lg:inline">Reject</span>
      </Button>
    </div>
  )
}
