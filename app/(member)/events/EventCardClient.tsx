'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, MapPin, Users, Trophy, Radio, ImageIcon, ExternalLink, Edit2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RSVPButton } from './RSVPButton'
import Image from 'next/image'

export function EventCardClient({ 
  event, 
  isPast = false, 
  isOngoing = false, 
  isRSVPd = false,
  isAdminView = false,
  onEditAction,
  onDeleteAction,
  onCardClickOverride
}: { 
  event: any, 
  isPast?: boolean, 
  isOngoing?: boolean, 
  isRSVPd?: boolean,
  isAdminView?: boolean,
  onEditAction?: () => void,
  onDeleteAction?: () => void,
  onCardClickOverride?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
  const startTime = new Date(`1970-01-01T${event.time_start}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const endTime = new Date(`1970-01-01T${event.time_end}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Determine the status badge
  let statusBadge = (
    <Badge className="bg-[#35408e]/10 text-[#35408e] border-none font-bold tracking-widest px-3 py-1 shadow-inner">
      UPCOMING
    </Badge>
  )
  if (isOngoing) {
    statusBadge = (
      <Badge className="bg-emerald-500 text-white font-extrabold tracking-wider px-3 py-1 animate-pulse border-none shadow-sm flex items-center gap-1.5">
        <Radio className="w-3.5 h-3.5" /> LIVE
      </Badge>
    )
  } else if (isPast) {
    statusBadge = (
      <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none font-bold tracking-widest px-3 py-1">
        COMPLETED
      </Badge>
    )
  }

  const CardInner = (
    <>
      {/* Status Badge */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
        {statusBadge}
      </div>

      {/* Large Circular Poster */}
      <div className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden relative shadow-lg mb-4 flex-shrink-0 group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500 bg-gray-100 flex items-center justify-center">
        {event.poster_url ? (
          <Image 
            src={event.poster_url} 
            alt={event.title} 
            fill 
            sizes="(max-width: 768px) 144px, 192px"
            className="object-cover" 
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300" />
        )}
      </div>

      {/* Date */}
      <p className="text-gray-500 text-base md:text-lg font-medium mb-1.5 md:mb-2">
        {eventDate}
      </p>

      {/* Points / Registration */}
      <p className="text-gray-900 text-base md:text-lg font-extrabold mb-1.5 md:mb-2">
        Earn {event.points_awarded || 0} Points
      </p>

      {/* Title */}
      <h3 className="text-[#35408e] text-xl md:text-2xl font-medium mb-1.5 md:mb-2 line-clamp-2 px-3">
        {event.title}
      </h3>

      {/* Main Category */}
      <p className="text-gray-400 text-xs md:text-sm font-bold">
        {event.event_type || 'General'}
      </p>
    </>
  )

  if (onCardClickOverride) {
    return (
      <Card 
        onClick={onCardClickOverride}
        className={`overflow-visible text-center transition-all duration-500 bg-transparent border-0 shadow-none hover:-translate-y-1.5 cursor-pointer group relative flex flex-col items-center p-3 md:p-6`}
      >
        {CardInner}
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        nativeButton={false}
        render={
          <Card className={`overflow-visible text-center transition-all duration-500 bg-transparent border-0 shadow-none hover:-translate-y-1.5 cursor-pointer group relative flex flex-col items-center p-3 md:p-6`} />
        }
      >
        {CardInner}
      </DialogTrigger>

      {/* EXPANDED MODAL (Dialog Content) */}
      <DialogContent className="max-w-3xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-white/95 backdrop-blur-3xl rounded-3xl border-white shadow-2xl flex flex-col max-h-[90vh] w-[95vw]">
        {/* Banner Section */}
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-100 flex items-center justify-center">
          {event.banner_url ? (
            <Image 
              src={event.banner_url} 
              alt={event.title} 
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
              className="object-cover" 
            />
          ) : event.poster_url ? (
            <Image 
              src={event.poster_url} 
              alt={event.title} 
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
              className="object-cover blur-sm opacity-60 scale-110" 
            />
          ) : (
            <ImageIcon className="w-16 h-16 text-gray-300" />
          )}
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4">
             {statusBadge}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
          <DialogHeader className="mb-6 space-y-4">
            <DialogTitle className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              {event.title}
            </DialogTitle>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full shadow-inner">
                {event.event_type || 'General'}
              </span>
              {event.themes?.map((theme: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  {theme}
                </span>
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Details Section */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">About this event</h4>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Horizontal Information Section (GDG Style) */}
            <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 border border-gray-100">
              
              {/* When */}
              <div className="flex items-start gap-4 lg:w-1/4">
                <div className="w-10 h-10 rounded-full bg-[#1e1e1e] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xl font-bold text-gray-900 mb-1">When</h5>
                  <p className="text-sm font-medium text-gray-600">{eventDate}</p>
                  <p className="text-sm font-medium text-gray-600">{startTime} – {endTime}</p>
                </div>
              </div>

              {/* Where */}
              {event.location && (
                <div className="flex items-start gap-4 lg:w-1/4">
                  <div className="w-10 h-10 rounded-full bg-[#1e1e1e] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-1">Where</h5>
                    <p className="text-sm font-medium text-gray-600 whitespace-pre-wrap">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Map Embed */}
              {event.location && (
                <div 
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank')}
                  className="flex-1 w-full h-48 lg:h-auto min-h-[120px] rounded-xl overflow-hidden relative shadow-sm border border-gray-200 group/map cursor-pointer bg-gray-100"
                >
                   <iframe
                     width="100%"
                     height="100%"
                     style={{ border: 0, pointerEvents: 'none' }}
                     loading="lazy"
                     allowFullScreen
                     referrerPolicy="no-referrer-when-downgrade"
                     src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                   ></iframe>
                   
                   {/* Maps Overlay Button */}
                   <div className="absolute inset-0 z-10 flex items-start justify-start p-3 bg-black/5 group-hover/map:bg-black/0 transition-colors">
                     <div className="bg-white px-3 py-1.5 rounded shadow-md text-blue-600 text-xs font-bold flex items-center gap-1.5 group-hover/map:bg-blue-50 transition-colors">
                       Maps <ExternalLink className="w-3.5 h-3.5" />
                     </div>
                   </div>
                </div>
              )}
            </div>

            {/* Additional Info Row (Points & Capacity) */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-orange-50 px-5 py-3 rounded-xl border border-orange-100 shadow-sm">
                <Trophy className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Reward</p>
                  <p className="text-sm font-medium text-gray-600">{event.points_awarded || 0} Points</p>
                </div>
              </div>
              {event.capacity && (
                <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 shadow-sm">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Capacity</p>
                    <p className="text-sm font-medium text-gray-600">Limited to {event.capacity} attendees</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer for RSVP or Admin Actions */}
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-20">
          <div className="text-sm text-gray-500 font-medium text-center sm:text-left">
            {!isAdminView && !isPast && event.capacity && (
              <span>Spaces are limited! Secure your spot early.</span>
            )}
            {!isAdminView && isPast && (
              <span>This event has already concluded.</span>
            )}
            {isAdminView && (
              <span>Admin Event Preview</span>
            )}
          </div>
          <div className="w-full sm:w-auto flex justify-center gap-3">
             {isAdminView ? (
               <>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDeleteAction?.(); }} 
                   className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                 >
                   Delete Event
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEditAction?.(); }} 
                   className="px-6 py-2.5 text-sm font-bold text-white bg-[#35408e] hover:bg-[#28316d] rounded-full transition-colors shadow-md flex items-center gap-2"
                 >
                   <Edit2 className="w-4 h-4" /> Edit Event
                 </button>
               </>
             ) : (
               !isPast && (
                 <div onClick={(e) => e.stopPropagation()}>
                   <RSVPButton eventId={event.id} initialIsRSVPd={isRSVPd} />
                 </div>
               )
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
