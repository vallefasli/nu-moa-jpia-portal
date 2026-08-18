import { createClient, getAuthenticatedUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CertificatesListClient } from './components/CertificatesListClient'

export default async function CertificatesPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const supabase = await createClient()

  // Fetch all attendance logs, feedbacks, and events
  const [attendanceRes, feedbackRes] = await Promise.all([
    supabase
      .from('attendance')
      .select(`
        event_id,
        type,
        timestamp,
        events ( id, title, date, points_awarded, certificate_link, auto_certificate_enabled, custom_feedback_questions, poster_url )
      `)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false }),
    supabase
      .from('event_feedbacks')
      .select('event_id, additional_responses')
      .eq('user_id', user.id)
  ])
  
  const attendanceLogs = attendanceRes.data || []
  const feedbackDataMap = new Map(feedbackRes.data?.map(f => [f.event_id, f]) || [])

  // Group by event_id to check for BOTH time_in and time_out
  const eventStatus = new Map()
  attendanceLogs.forEach(log => {
    if (!eventStatus.has(log.event_id)) {
      eventStatus.set(log.event_id, {
        hasTimeIn: false,
        hasTimeOut: false,
        event: log.events
      })
    }
    
    const status = eventStatus.get(log.event_id)
    if (log.type === 'time_in') status.hasTimeIn = true
    if (log.type === 'time_out') status.hasTimeOut = true
  })
  
  // An event is "earned" if the user has a time_out (covers normal flow and forced time_out overrides)
  const earnedEvents = Array.from(eventStatus.values())
    .filter(status => status.hasTimeOut)
    .map(status => status.event)

  // Convert Map to a plain object for the client component
  const feedbackObject: Record<string, any> = {}
  feedbackDataMap.forEach((val, key) => {
    feedbackObject[key] = val
  })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Portfolio & Certificates</h1>
        <p className="text-gray-500 mt-1">Review your attended events, submit feedback, and access certificates.</p>
      </div>

      <CertificatesListClient 
        earnedEvents={earnedEvents}
        feedbackMap={feedbackObject}
      />
    </div>
  )
}
