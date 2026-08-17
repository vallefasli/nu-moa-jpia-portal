import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, MapPin, Users, Trophy, Radio } from 'lucide-react'
import { EventCardClient } from './EventCardClient'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
    .order('time_start', { ascending: true })

  // Fetch the current user's RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('event_id')
    .eq('user_id', user.id)

  const userRsvpEventIds = new Set(rsvps?.map(r => r.event_id) || [])

  const now = new Date()

  const ongoingEvents: any[] = []
  const upcomingEvents: any[] = []
  const pastEvents: any[] = []

  events?.forEach(e => {
    // Construct start and end Date objects safely
    const startTimeStr = e.time_start ? e.time_start.slice(0, 8) : '00:00:00'
    const endTimeStr = e.time_end ? e.time_end.slice(0, 8) : '23:59:59'
    
    const start = new Date(`${e.date}T${startTimeStr}+08:00`)
    const end = new Date(`${e.date}T${endTimeStr}+08:00`)

    if (e.status === 'completed' || now > end) {
      pastEvents.push(e)
    } else if (e.status === 'ongoing' || (now >= start && now <= end)) {
      ongoingEvents.push(e)
    } else {
      upcomingEvents.push(e)
    }
  })

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-10">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Events Board</h1>
        <p className="text-gray-500 mt-1">Discover organization events and track your participation.</p>
      </div>

      {/* 1. ONGOING / HAPPENING NOW SECTION */}
      {ongoingEvents.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-emerald-700">Happening Now</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {ongoingEvents.map((event) => (
              <EventCardClient key={event.id} event={event} isOngoing isRSVPd={userRsvpEventIds.has(event.id)} />
            ))}
          </div>
        </div>
      )}

      {/* 2. UPCOMING EVENTS SECTION */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg text-[#fbb03b] shadow-inner">
            <CalendarDays className="w-5 h-5" />
          </div>
          Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card className="border-dashed border-2 bg-white/50 backdrop-blur-sm border-gray-200">
            <CardContent className="p-12 text-center text-gray-400 flex flex-col items-center">
              <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No upcoming events scheduled at the moment.</p>
              <p className="text-sm mt-1">Check back soon for new announcements!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <EventCardClient key={event.id} event={event} isRSVPd={userRsvpEventIds.has(event.id)} />
            ))}
          </div>
        )}
      </div>

      {/* 3. PAST EVENTS SECTION */}
      <div className="pt-10 border-t-2 border-dashed border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <h2 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2">
          Past Events
        </h2>
        {pastEvents.length === 0 ? (
          <p className="text-gray-400 text-sm italic font-medium">No past events found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 opacity-70 hover:opacity-100 transition-opacity duration-500 grayscale-[40%] hover:grayscale-0">
            {pastEvents.slice().reverse().map((event) => (
              <EventCardClient key={event.id} event={event} isPast isRSVPd={userRsvpEventIds.has(event.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
