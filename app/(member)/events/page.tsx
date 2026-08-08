import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, MapPin, Users, Trophy, Radio } from 'lucide-react'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all events, ordered by date
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  const now = new Date()

  const ongoingEvents: any[] = []
  const upcomingEvents: any[] = []
  const pastEvents: any[] = []

  events?.forEach(e => {
    // Construct start and end Date objects safely
    const startTimeStr = e.time_start ? e.time_start.slice(0, 8) : '00:00:00'
    const endTimeStr = e.time_end ? e.time_end.slice(0, 8) : '23:59:59'
    
    const start = new Date(`${e.date}T${startTimeStr}`)
    const end = new Date(`${e.date}T${endTimeStr}`)

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
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#35408e] tracking-tight">Events Board</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base font-medium">Discover organization events and track your participation.</p>
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
              <EventCard key={event.id} event={event} isOngoing />
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
              <EventCard key={event.id} event={event} />
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
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, isPast = false, isOngoing = false }: { event: any, isPast?: boolean, isOngoing?: boolean }) {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
  const startTime = new Date(`1970-01-01T${event.time_start}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const endTime = new Date(`1970-01-01T${event.time_end}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <Card className={`overflow-hidden transition-all duration-500 bg-white/90 backdrop-blur-xl border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${isOngoing ? 'ring-2 ring-emerald-500/50 shadow-emerald-500/10' : ''} ${!isPast ? 'hover:shadow-[0_20px_40px_-15px_rgba(53,64,142,0.15)] hover:-translate-y-1.5 cursor-pointer group' : ''}`}>
      <div className={`h-2.5 w-full transition-all duration-500 ${isOngoing ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse' : isPast ? 'bg-gray-200' : 'bg-gradient-to-r from-[#35408e] via-[#4e5ec7] to-[#fbb03b] group-hover:h-3'}`} />
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className={`text-lg font-bold leading-tight tracking-tight ${!isPast ? 'group-hover:text-[#35408e] transition-colors' : ''}`}>
            {event.title}
          </CardTitle>
          {isOngoing ? (
            <Badge className="bg-emerald-500 text-white font-extrabold tracking-wider px-3 py-1 animate-pulse border-none shadow-sm flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> LIVE
            </Badge>
          ) : isPast ? (
            <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none font-bold tracking-widest px-3 py-1">
              COMPLETED
            </Badge>
          ) : (
            <Badge className="bg-[#35408e]/10 text-[#35408e] hover:bg-[#35408e]/20 border-none font-bold tracking-widest px-3 py-1 shadow-inner">
              UPCOMING
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 mt-3 text-sm leading-relaxed text-gray-500">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <CalendarDays className="w-4 h-4 text-gray-400" />
          </div>
          <span className="tracking-wide">{eventDate}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <span className="tracking-wide">{startTime} - {endTime}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <span className="tracking-wide">{event.location}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100/50 shadow-sm">
          <Trophy className="w-4 h-4 text-yellow-500" />
          +{event.points_awarded || 0} pts
        </div>
        {event.capacity && (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <Users className="w-3.5 h-3.5" />
            {event.capacity} Max
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
