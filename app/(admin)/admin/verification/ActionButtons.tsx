'use client'

import { Button } from '@/components/ui/button'
import { approveUser, rejectUser } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { useTransition } from 'react'

export function ActionButtons({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex justify-end items-center gap-2">
      <Button
        size="sm"
        variant="default"
        className="bg-green-600 hover:bg-green-700 h-8"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await approveUser(userId)
            if (res.error) toast.error(res.error)
            else toast.success('User approved successfully!')
          })
        }}
      >
        <Check className="w-4 h-4 mr-1" /> Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-8"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await rejectUser(userId)
            if (res.error) toast.error(res.error)
            else toast.success('User rejected.')
          })
        }}
      >
        <X className="w-4 h-4 mr-1" /> Reject
      </Button>
    </div>
  )
}
