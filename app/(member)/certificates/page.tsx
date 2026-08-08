import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Award } from 'lucide-react'
import { EventRecordCard } from './components/EventRecordCard'

export default async function CertificatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Fetch all attendance logs, feedbacks, and events
  const [attendanceRes, feedbackRes] = await Promise.all([
    supabase
      .from('attendance')
      .select(`
        event_id,
        type,
        timestamp,
        events ( id, title, date, points_awarded, certificate_link, custom_feedback_questions )
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
  
  // An event is only "earned" if the user has BOTH time_in and time_out
  const earnedEvents = Array.from(eventStatus.values())
    .filter(status => status.hasTimeIn && status.hasTimeOut)
    .map(status => status.event)

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Portfolio & Certificates</h1>
        <p className="text-gray-500 mt-1">Review your attended events, submit feedback, and access certificates.</p>
      </div>

      {earnedEvents.length === 0 ? (
        <Card className="border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No events attended yet</h3>
            <p className="text-gray-500 max-w-sm mt-1">Attend JPIA events and make sure to scan your QR code to earn records and certificates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {earnedEvents.map(ev => (
            <EventRecordCard 
              key={ev.id} 
              event={ev} 
              feedbackSubmitted={feedbackDataMap.has(ev.id)}
              feedbackData={feedbackDataMap.get(ev.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
