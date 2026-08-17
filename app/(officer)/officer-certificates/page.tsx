import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CertificatesClient } from './CertificatesClient'

export const dynamic = 'force-dynamic'

export default async function CertificatesPage() {
  const supabase = await createClient()

  // 1. Authenticate & Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'officer') {
    redirect('/dashboard')
  }

  // 2. Fetch all events with feedback count
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id, 
      title, 
      status, 
      date, 
      time_start,
      time_end,
      certificate_link,
      custom_feedback_questions,
      poster_url,
      event_feedbacks (count)
    `)
    .in('status', ['ongoing', 'completed', 'upcoming']) // mostly interested in ones that could have feedback
    .order('date', { ascending: false })
    .order('time_start', { ascending: false })
  
  if (error) {
    console.error("Error fetching events:", error)
  }

  // Format the events to extract the count easily
  const formattedEvents = (events || []).map(event => {
    // Supabase returns { count: number } inside an array for relations if not mapped properly,
    // or just the count if specified in a certain way. 
    // Usually it's an array of length 1: [{ count: 5 }] or just count.
    let feedbackCount = 0
    if (Array.isArray(event.event_feedbacks) && event.event_feedbacks.length > 0) {
      if (typeof event.event_feedbacks[0]?.count === 'number') {
        feedbackCount = event.event_feedbacks[0].count
      } else {
        feedbackCount = event.event_feedbacks.length
      }
    } else if (event.event_feedbacks && typeof (event.event_feedbacks as any).count === 'number') {
      feedbackCount = (event.event_feedbacks as any).count
    }

    return {
      id: event.id,
      title: event.title,
      status: event.status,
      date: event.date,
      time_start: event.time_start,
      time_end: event.time_end,
      certificate_link: event.certificate_link,
      custom_feedback_questions: event.custom_feedback_questions || [],
      poster_url: event.poster_url,
      feedbackCount
    }
  })

  return (
    <div className="min-h-full pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Event Certificates</h1>
          <p className="text-gray-500 mt-1">Select an event below to distribute certificates to members who submitted feedback.</p>
        </div>

        <CertificatesClient events={formattedEvents} />
      </div>
    </div>
  )
}
