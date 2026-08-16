'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Users, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { exportConsolidatedAttendance } from './actions'

export function ReportsClient({ 
  users, 
  events 
}: { 
  users: any[], 
  events: any[] 
}) {

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""'
    return `"${String(val).replace(/"/g, '""')}"`
  }

  const exportRoster = () => {
    const headers = ['Member ID', 'Student No', 'First Name', 'Middle Name', 'Last Name', 'Full Name', 'Email', 'Program', 'Year Level', 'Committee', 'Role', 'Status']
    const rows = users.map(u => [
      u.member_id,
      u.student_no,
      u.first_name || '',
      u.middle_name || '',
      u.last_name || '',
      u.full_name,
      u.email,
      u.program,
      u.year_level,
      u.committee || 'None',
      u.role,
      u.account_status
    ])
    
    const csvContent = [
      headers.map(escapeCsv).join(','), 
      ...rows.map(r => r.map(escapeCsv).join(','))
    ].join('\n')
    
    downloadCSV(csvContent, `JPIA_Master_Roster_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportAttendance = async (eventId: string, eventTitle: string) => {
    const toastId = toast.loading('Generating consolidated report...')
    try {
      const res = await exportConsolidatedAttendance(eventId)
      
      if (res.error || !res.records) {
        toast.error(res.error || 'Failed to generate report', { id: toastId })
        return
      }

      const headers = ['Member ID', 'Student No', 'First Name', 'Middle Name', 'Last Name', 'Full Name', 'Program', 'Registration Status', 'Time In', 'Time In Recorded By', 'Time Out', 'Time Out Recorded By']
      const rows = res.records.map((log: any) => [
        log.member_id || '',
        log.student_no || '',
        log.first_name || '',
        log.middle_name || '',
        log.last_name || '',
        log.full_name || '',
        log.program || '',
        log.is_registered ? 'RSVP\'d' : 'Walk-in',
        log.time_in ? new Date(log.time_in).toLocaleString() : '',
        log.time_in_officer || '',
        log.time_out ? new Date(log.time_out).toLocaleString() : '',
        log.time_out_officer || ''
      ])
      
      const csvContent = [
        headers.map(escapeCsv).join(','), 
        ...rows.map(r => r.map(escapeCsv).join(','))
      ].join('\n')
      
      downloadCSV(csvContent, `Attendance_${eventTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Report downloaded successfully', { id: toastId })
    } catch (error) {
      toast.error('An error occurred during generation', { id: toastId })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Roster Export */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-[#35408e]" />
          </div>
          <CardTitle>Master Roster</CardTitle>
          <CardDescription>Download a complete list of all registered members, officers, and admins.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportRoster} className="w-full bg-[#35408e] hover:bg-[#2a3370]">
            <Download className="w-4 h-4 mr-2" /> Export Roster to CSV
          </Button>
          <p className="text-xs text-gray-500 mt-4">Includes active, pending, and rejected accounts.</p>
        </CardContent>
      </Card>

      {/* Attendance Export */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
            <ClipboardList className="w-5 h-5 text-yellow-600" />
          </div>
          <CardTitle>Event Attendance</CardTitle>
          <CardDescription>Download the consolidated attendance logs for a specific event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <div className="font-bold text-sm text-gray-900">{ev.title}</div>
                  <div className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => exportAttendance(ev.id, ev.title)}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">No events found.</div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
