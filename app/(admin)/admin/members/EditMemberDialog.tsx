'use client'

import { useState, useTransition } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'
import { updateMemberProfile } from '@/app/(admin)/actions'

type User = {
  id: string
  full_name: string
  student_no: string
  program: string
  year_level: string
  committee: string
  role: string
}

export function EditMemberDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get('full_name') as string,
      student_no: formData.get('student_no') as string,
      program: formData.get('program') as string,
      year_level: formData.get('year_level') as string,
      committee: formData.get('committee') as string,
      role: formData.get('role') as string,
    }

    startTransition(async () => {
      const res = await updateMemberProfile(user.id, data)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Profile updated successfully.')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Member Profile</DialogTitle>
            <DialogDescription>
              Make changes to {user.full_name}'s profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" defaultValue={user.full_name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_no">Student Number</Label>
              <Input id="student_no" name="student_no" defaultValue={user.student_no} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <select 
                id="program" 
                name="program" 
                required 
                defaultValue={user.program}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="BS Accountancy">BS Accountancy</option>
                <option value="BS Management Accounting">BS Management Accounting</option>
                <option value="BS Business Administration">BS Business Administration</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_level">Year Level</Label>
              <select 
                id="year_level" 
                name="year_level" 
                required 
                defaultValue={user.year_level}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
                <option value="Irregular">Irregular / Extended</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="committee">Committee</Label>
              <select 
                id="committee" 
                name="committee" 
                defaultValue={user.committee || 'None'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="None">None (General Member)</option>
                <option value="Academics">Academics</option>
                <option value="Non-Academics">Non-Academics</option>
                <option value="Membership">Membership</option>
                <option value="Finance">Finance</option>
                <option value="Audit">Audit</option>
                <option value="Communications">Communications</option>
                <option value="Creatives">Creatives</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role" 
                name="role" 
                defaultValue={user.role || 'member'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="member">Member</option>
                <option value="officer">Officer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
