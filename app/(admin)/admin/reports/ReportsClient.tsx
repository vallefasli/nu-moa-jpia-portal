'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Users, 
  ClipboardList, 
  Trophy, 
  MessageSquareQuote, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  FileSpreadsheet, 
  Sparkles, 
  Layers, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  UserCheck,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { exportConsolidatedAttendance, exportEventFeedback, exportPointsLeaderboard } from './actions'
import { getEventStatus } from '@/lib/utils'

interface ReportsClientProps {
  users: any[]
  events: any[]
}

export function ReportsClient({ users, events }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'leaderboard' | 'feedback'>('roster')

  // Roster Filter State
  const [rosterSearch, setRosterSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [programFilter, setProgramFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [committeeFilter, setCommitteeFilter] = useState('all')
  const [isExportingRoster, setIsExportingRoster] = useState(false)

  // Event Attendance Search State
  const [eventSearch, setEventSearch] = useState('')
  const [exportingEventId, setExportingEventId] = useState<string | null>(null)

  // Leaderboard Export State
  const [isExportingLeaderboard, setIsExportingLeaderboard] = useState(false)

  // Feedback Export State
  const [feedbackEventSearch, setFeedbackEventSearch] = useState('')
  const [exportingFeedbackId, setExportingFeedbackId] = useState<string | null>(null)

  // Filter out System Account, Admins, and Rejected accounts from member exports
  const validUsers = users.filter(u => 
    u.full_name !== 'System Account' && 
    u.full_name !== 'System Admin' && 
    u.role !== 'admin' &&
    u.account_status !== 'rejected'
  )

  // Calculate High-level Summary Metrics
  const activeMembersCount = validUsers.filter(u => u.account_status === 'active').length
  const pendingMembersCount = validUsers.filter(u => u.account_status === 'pending').length
  const totalAttendanceLogged = events.reduce((acc, curr) => acc + (curr.attendanceCount || 0), 0)
  const totalFeedbackSubmitted = events.reduce((acc, curr) => acc + (curr.feedbackCount || 0), 0)

  // Helper to trigger safe CSV download with UTF-8 BOM
  const downloadCSV = (content: string, filename: string) => {
    // \uFEFF is UTF-8 BOM to ensure Excel opens accented names & symbols correctly
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
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

  // Filter Roster
  const filteredUsers = validUsers.filter(u => {
    const matchesSearch = !rosterSearch || 
      u.full_name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.student_no?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.member_id?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(rosterSearch.toLowerCase())

    const matchesStatus = statusFilter === 'all' || u.account_status === statusFilter
    const matchesProgram = programFilter === 'all' || u.program === programFilter
    const matchesYear = yearFilter === 'all' || u.year_level === yearFilter
    const matchesCommittee = committeeFilter === 'all' || (u.committee || 'None') === committeeFilter

    return matchesSearch && matchesStatus && matchesProgram && matchesYear && matchesCommittee
  })

  // 1. Export Master Roster
  const handleExportRoster = () => {
    setIsExportingRoster(true)
    try {
      const headers = [
        'Member ID',
        'Student Number',
        'First Name',
        'Middle Name',
        'Last Name',
        'Full Name',
        'Personal Email',
        'Student Email',
        'Program',
        'Year Level',
        'Committee',
        'Role',
        'Account Status',
        'Registration Date'
      ]

      const rows = filteredUsers.map(u => [
        u.member_id || '',
        u.student_no || '',
        u.first_name || '',
        u.middle_name || '',
        u.last_name || '',
        u.full_name || '',
        u.email || '',
        u.student_email || '',
        u.program || '',
        u.year_level || '',
        u.committee || 'None',
        u.role || 'member',
        u.account_status || 'active',
        u.created_at ? new Date(u.created_at).toLocaleDateString('en-US') : ''
      ])

      const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(r => r.map(escapeCsv).join(','))
      ].join('\n')

      const dateStr = new Date().toISOString().split('T')[0]
      const statusSuffix = statusFilter !== 'all' ? `_${statusFilter.toUpperCase()}` : ''
      downloadCSV(csvContent, `NU_MOA_JPIA_Roster${statusSuffix}_${dateStr}.csv`)
      toast.success(`Exported ${filteredUsers.length} member records!`)
    } catch (e) {
      toast.error('Failed to export member roster.')
    } finally {
      setIsExportingRoster(false)
    }
  }

  // 2. Export Consolidated Event Attendance
  const handleExportAttendance = async (eventId: string, eventTitle: string) => {
    setExportingEventId(eventId)
    const toastId = toast.loading(`Generating attendance report for "${eventTitle}"...`)
    try {
      const res = await exportConsolidatedAttendance(eventId)
      if (res.error || !res.records) {
        toast.error(res.error || 'Failed to generate report', { id: toastId })
        return
      }

      const headers = [
        'Member ID',
        'Student Number',
        'First Name',
        'Middle Name',
        'Last Name',
        'Full Name',
        'Program',
        'Year Level',
        'Committee',
        'Email',
        'RSVP Status',
        'Time In Timestamp',
        'Time In Verified By',
        'Time Out Timestamp',
        'Time Out Verified By'
      ]

      const rows = res.records.map((log: any) => [
        log.member_id || '',
        log.student_no || '',
        log.first_name || '',
        log.middle_name || '',
        log.last_name || '',
        log.full_name || '',
        log.program || '',
        log.year_level || '',
        log.committee || 'None',
        log.email || '',
        log.is_registered ? 'Registered (RSVP)' : 'Walk-in',
        log.time_in ? new Date(log.time_in).toLocaleString('en-US') : 'No Time In',
        log.time_in_officer || '—',
        log.time_out ? new Date(log.time_out).toLocaleString('en-US') : 'No Time Out',
        log.time_out_officer || '—'
      ])

      const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(r => r.map(escapeCsv).join(','))
      ].join('\n')

      const dateStr = new Date().toISOString().split('T')[0]
      const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_')
      downloadCSV(csvContent, `NU_MOA_JPIA_Attendance_${sanitizedTitle}_${dateStr}.csv`)
      toast.success(`Exported ${res.records.length} attendance records!`, { id: toastId })
    } catch (error) {
      toast.error('An error occurred during generation', { id: toastId })
    } finally {
      setExportingEventId(null)
    }
  }

  // 3. Export Points & Leaderboard
  const handleExportLeaderboard = async () => {
    setIsExportingLeaderboard(true)
    const toastId = toast.loading('Compiling organizational points leaderboard...')
    try {
      const res = await exportPointsLeaderboard()
      if (res.error || !res.records) {
        toast.error(res.error || 'Failed to fetch leaderboard data', { id: toastId })
        return
      }

      const headers = [
        'Rank',
        'Member ID',
        'Student Number',
        'First Name',
        'Middle Name',
        'Last Name',
        'Full Name',
        'Program',
        'Year Level',
        'Committee',
        'Events Attended',
        'Total Points',
        'Membership Tier'
      ]

      const rows = res.records.map((item: any, idx: number) => {
        const points = Number(item.total_points) || 0
        const tier = points >= 151 ? 'Gold' : points >= 51 ? 'Silver' : 'Bronze'
        return [
          idx + 1,
          item.member_id || '',
          item.student_no || '',
          item.first_name || '',
          item.middle_name || '',
          item.last_name || '',
          item.full_name || '',
          item.program || '',
          item.year_level || '',
          item.committee || 'None',
          item.events_attended || 0,
          points,
          tier
        ]
      })

      const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(r => r.map(escapeCsv).join(','))
      ].join('\n')

      const dateStr = new Date().toISOString().split('T')[0]
      downloadCSV(csvContent, `NU_MOA_JPIA_Points_Leaderboard_${dateStr}.csv`)
      toast.success(`Exported points leaderboard for ${res.records.length} active members!`, { id: toastId })
    } catch (e) {
      toast.error('Failed to export leaderboard.', { id: toastId })
    } finally {
      setIsExportingLeaderboard(false)
    }
  }

  // 4. Export Event Feedback
  const handleExportFeedback = async (eventId: string, eventTitle: string) => {
    setExportingFeedbackId(eventId)
    const toastId = toast.loading(`Extracting feedback survey responses for "${eventTitle}"...`)
    try {
      const res = await exportEventFeedback(eventId)
      if (res.error || !res.feedbacks) {
        toast.error(res.error || 'Failed to fetch feedback records', { id: toastId })
        return
      }

      if (res.feedbacks.length === 0) {
        toast.error('No feedback submissions found for this event.', { id: toastId })
        return
      }

      const customQuestionKeys = (res.customQuestions || []).map((q: any) => q.question || q.id)

      const headers = [
        'Submission ID',
        'Submission Date',
        'Member ID',
        'Student Number',
        'First Name',
        'Middle Name',
        'Last Name',
        'Full Name',
        'Program',
        'Year Level',
        'Committee',
        'Rating (1-5)',
        'General Comment',
        ...customQuestionKeys
      ]

      const rows = res.feedbacks.map((f: any) => {
        const u = f.users || {}
        const addResponses = f.additional_responses || {}

        const customAnswers = (res.customQuestions || []).map((q: any) => {
          const ans = addResponses[q.id] ?? addResponses[q.question]
          if (ans === undefined || ans === null) return ''
          return Array.isArray(ans) ? ans.join('; ') : String(ans)
        })

        return [
          f.id,
          new Date(f.created_at).toLocaleString('en-US'),
          u.member_id || '',
          u.student_no || '',
          u.first_name || '',
          u.middle_name || '',
          u.last_name || '',
          u.full_name || '',
          u.program || '',
          u.year_level || '',
          u.committee || 'None',
          f.rating || '',
          f.comment || '',
          ...customAnswers
        ]
      })

      const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(r => r.map(escapeCsv).join(','))
      ].join('\n')

      const dateStr = new Date().toISOString().split('T')[0]
      const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_')
      downloadCSV(csvContent, `NU_MOA_JPIA_Feedback_${sanitizedTitle}_${dateStr}.csv`)
      toast.success(`Exported ${res.feedbacks.length} feedback submissions!`, { id: toastId })
    } catch (e) {
      toast.error('Failed to export feedback survey.', { id: toastId })
    } finally {
      setExportingFeedbackId(null)
    }
  }

  // Filtered Events for Attendance Tab
  const filteredEventsForAttendance = events.filter(e => 
    e.title.toLowerCase().includes(eventSearch.toLowerCase())
  )

  // Filtered Events for Feedback Tab
  const filteredEventsForFeedback = events.filter(e => 
    e.title.toLowerCase().includes(feedbackEventSearch.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header Section with Brand Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Data Export Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate, filter, and export clean CSV datasets for official organization documentation, auditing, and analytics.
          </p>
        </div>
      </div>

      {/* Summary Metric Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Members</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{activeMembersCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{pendingMembersCount} pending approvals</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#35408e] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{events.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Recorded in portal</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance Logs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#fbb03b] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalAttendanceLogged}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Time In & Time Out Logs</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Feedback Logs</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalFeedbackSubmitted}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Survey responses collected</div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'roster'
              ? 'bg-[#35408e] text-white shadow-md shadow-[#35408e]/20'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Master Member Roster
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'attendance'
              ? 'bg-[#35408e] text-white shadow-md shadow-[#35408e]/20'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Event Attendance & RSVPs
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-[#35408e] text-white shadow-md shadow-[#35408e]/20'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Points Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'feedback'
              ? 'bg-[#35408e] text-white shadow-md shadow-[#35408e]/20'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          Feedback & Surveys
        </button>
      </div>

      {/* TAB 1: MASTER ROSTER EXPORT */}
      {activeTab === 'roster' && (
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-transparent border-b border-gray-100 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#35408e]/10 text-[#35408e] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Master Membership Roster</CardTitle>
                    <CardDescription className="text-xs">
                      Export active, pending, or filtered member lists with full academic and committee assignments.
                    </CardDescription>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleExportRoster}
                disabled={isExportingRoster || filteredUsers.length === 0}
                className="bg-[#35408e] hover:bg-[#28316d] text-white font-bold h-11 px-6 rounded-xl shadow-md gap-2"
              >
                {isExportingRoster ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {filteredUsers.length} Records to CSV
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Filter Toolbar */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                Customize Export Dataset
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search name, ID, student #..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="pl-9 h-10 bg-white border-gray-200 text-xs"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#35408e]"
                  >
                    <option value="all">All (Active & Pending)</option>
                    <option value="active">Active Members Only</option>
                    <option value="pending">Pending Accounts</option>
                  </select>
                </div>

                {/* Program Filter */}
                <div>
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#35408e]"
                  >
                    <option value="all">All Programs</option>
                    <option value="BS Accountancy">BS Accountancy</option>
                    <option value="BS Management Accounting">BS Management Accounting</option>
                    <option value="BS Business Administration">BS Business Administration</option>
                  </select>
                </div>

                {/* Year Level Filter */}
                <div>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#35408e]"
                  >
                    <option value="all">All Year Levels</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Extended Year">Extended Year</option>
                  </select>
                </div>

                {/* Committee Filter */}
                <div>
                  <select
                    value={committeeFilter}
                    onChange={(e) => setCommitteeFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#35408e]"
                  >
                    <option value="all">All Committees</option>
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
              </div>
            </div>

            {/* Live Preview List */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-500">
                <span>Dataset Preview ({filteredUsers.length} records selected)</span>
                {filteredUsers.length > 5 && (
                  <span>Showing first 5 of {filteredUsers.length}</span>
                )}
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  No members match your selected filters.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <div key={user.id || user.student_no} className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#35408e]/10 text-[#35408e] font-bold text-xs flex items-center justify-center">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900 leading-tight">{user.full_name}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {user.member_id || 'Pending ID'} &middot; {user.student_no}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-600 border-gray-200">
                          {user.program || 'No Program'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            user.account_status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                              : user.account_status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'
                              : 'bg-red-50 text-red-700 border-red-200 text-[10px]'
                          }
                        >
                          {user.account_status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: EVENT ATTENDANCE & RSVPS */}
      {activeTab === 'attendance' && (
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-amber-50/50 via-white to-transparent border-b border-gray-100 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#fbb03b]/20 text-[#fbb03b] flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Event Attendance & RSVPs</CardTitle>
                  <CardDescription className="text-xs">
                    Export consolidated registration logs, Time In timestamps, Time Out timestamps, and scanning officers.
                  </CardDescription>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="pl-9 h-10 bg-white border-gray-200 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredEventsForAttendance.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No events found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEventsForAttendance.map((ev) => {
                  const effectiveStatus = getEventStatus(ev)
                  const isExportingThis = exportingEventId === ev.id

                  return (
                    <div
                      key={ev.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#35408e]/30 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className={
                              effectiveStatus === 'ongoing'
                                ? 'bg-emerald-500 text-white font-bold text-[9px]'
                                : effectiveStatus === 'completed'
                                ? 'bg-gray-100 text-gray-600 text-[9px]'
                                : 'bg-blue-50 text-[#35408e] text-[9px]'
                            }
                          >
                            {effectiveStatus.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-[#35408e] transition-colors line-clamp-1">
                          {ev.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                          <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            {ev.rsvpCount || 0} RSVPs
                          </span>
                          <span className="bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                            {ev.attendanceCount || 0} Attended
                          </span>
                          <span className="bg-[#35408e]/5 border border-[#35408e]/10 text-[#35408e] px-2 py-0.5 rounded-md font-medium">
                            {ev.points_awarded || 0} pts
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleExportAttendance(ev.id, ev.title)}
                        disabled={isExportingThis}
                        variant="outline"
                        className="w-full bg-gray-50 hover:bg-[#35408e] hover:text-white border-gray-200 font-bold text-xs h-10 rounded-xl transition-all gap-2"
                      >
                        {isExportingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Generating CSV...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Download Attendance CSV
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: POINTS & LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-yellow-50/50 via-white to-transparent border-b border-gray-100 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Points & Engagement Leaderboard</CardTitle>
                  <CardDescription className="text-xs">
                    Download official rankings, accumulated points, and membership reward tier breakdown.
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleExportLeaderboard}
                disabled={isExportingLeaderboard}
                className="bg-[#35408e] hover:bg-[#28316d] text-white font-bold h-11 px-6 rounded-xl shadow-md gap-2"
              >
                {isExportingLeaderboard ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Leaderboard CSV
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-yellow-50/60 border border-yellow-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  🥇
                </div>
                <div>
                  <div className="font-bold text-sm text-yellow-900">Gold Tier</div>
                  <div className="text-[11px] text-yellow-700 font-medium">151+ Points</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-400 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  🥈
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">Silver Tier</div>
                  <div className="text-[11px] text-slate-600 font-medium">51 - 150 Points</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  🥉
                </div>
                <div>
                  <div className="font-bold text-sm text-amber-900">Bronze Tier</div>
                  <div className="text-[11px] text-amber-700 font-medium">0 - 50 Points</div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900">Complete Points Breakdown</h4>
                <p className="text-xs text-gray-500">
                  The generated CSV report will contain all verified members ordered by rank with student IDs, committee assignments, and attended event counts.
                </p>
              </div>
              <Button
                onClick={handleExportLeaderboard}
                disabled={isExportingLeaderboard}
                variant="outline"
                className="bg-white border-gray-200 text-[#35408e] hover:bg-blue-50 font-bold text-xs h-10 rounded-xl shadow-sm gap-2 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Download Report (.CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: EVENT FEEDBACK & SURVEYS */}
      {activeTab === 'feedback' && (
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50/50 via-white to-transparent border-b border-gray-100 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Event Feedback & Survey Responses</CardTitle>
                  <CardDescription className="text-xs">
                    Export participant evaluation ratings, comments, and answers to custom survey questions for any event.
                  </CardDescription>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={feedbackEventSearch}
                  onChange={(e) => setFeedbackEventSearch(e.target.value)}
                  className="pl-9 h-10 bg-white border-gray-200 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredEventsForFeedback.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No events found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEventsForFeedback.map((ev) => {
                  const isExportingThis = exportingFeedbackId === ev.id
                  const feedbackCount = ev.feedbackCount || 0

                  return (
                    <div
                      key={ev.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-bold"
                          >
                            {feedbackCount} {feedbackCount === 1 ? 'Response' : 'Responses'}
                          </Badge>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {feedbackCount > 0 
                            ? 'Ready for export with member ratings and detailed responses.' 
                            : 'No feedback submissions recorded yet.'}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleExportFeedback(ev.id, ev.title)}
                        disabled={isExportingThis || feedbackCount === 0}
                        variant="outline"
                        className={`w-full font-bold text-xs h-10 rounded-xl transition-all gap-2 ${
                          feedbackCount > 0
                            ? 'bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border-purple-200'
                            : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {isExportingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Extracting Responses...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            {feedbackCount > 0 ? 'Download Feedback CSV' : 'No Submissions'}
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
