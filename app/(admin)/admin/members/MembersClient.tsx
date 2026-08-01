'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditMemberDialog } from './EditMemberDialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { removeMember } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { useTransition } from 'react'

type User = {
  id: string
  full_name: string
  student_no: string
  member_id: string
  program: string
  year_level: string
  committee: string
  email: string
  created_at: string
  account_status: string
}

export default function MembersClient({ initialUsers }: { initialUsers: User[] }) {
  const [isPending, startTransition] = useTransition()

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Irregular']

  const handleRemove = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}? They will no longer be able to log in.`)) {
      startTransition(async () => {
        const res = await removeMember(userId)
        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success(`${name} has been removed.`)
        }
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Directory</CardTitle>
        <CardDescription>Browse all registered members grouped by their academic year.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1st Year" className="w-full">
          <TabsList className="flex flex-wrap h-auto mb-6">
            {yearLevels.map((year) => (
              <TabsTrigger key={year} value={year} className="flex-1 min-w-[100px]">
                {year}
              </TabsTrigger>
            ))}
          </TabsList>

          {yearLevels.map((year) => {
            const yearUsers = initialUsers.filter(u => u.year_level === year || (year === 'Irregular' && !yearLevels.slice(0, 5).includes(u.year_level)))
            
            return (
              <TabsContent key={year} value={year}>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Student No.</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Committee</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No active members found in this year level.
                          </TableCell>
                        </TableRow>
                      ) : (
                        yearUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.student_no}</TableCell>
                            <TableCell>{user.program}</TableCell>
                            <TableCell>{user.committee || 'None'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <EditMemberDialog user={user} />
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  disabled={isPending}
                                  onClick={() => handleRemove(user.id, user.full_name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
