'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditMemberDialog } from './EditMemberDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Search } from 'lucide-react'
import { removeMember } from '@/app/(admin)/actions'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { Badge } from '@/components/ui/badge'

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
  role: string
}

export default function MembersClient({ initialUsers }: { initialUsers: User[] }) {
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')

  const yearLevels = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Irregular']

  const filteredUsers = initialUsers.filter(u => 
    !searchQuery || 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.student_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.program.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, student number, or program..." 
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="All" className="w-full">
          <TabsList className="flex flex-wrap h-auto mb-6">
            {yearLevels.map((year) => (
              <TabsTrigger key={year} value={year} className="flex-1 min-w-[100px]">
                {year}
              </TabsTrigger>
            ))}
          </TabsList>

          {yearLevels.map((year) => {
            const yearUsers = year === 'All' 
              ? filteredUsers 
              : filteredUsers.filter(u => u.year_level === year || (year === 'Irregular' && !yearLevels.slice(1, 6).includes(u.year_level)))
            
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
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {user.full_name}
                                {user.role === 'officer' && (
                                  <Badge variant="secondary" className="text-[10px] uppercase bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    Officer
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
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
