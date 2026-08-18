'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, MapPin, Users, Trophy, Radio, ImageIcon, ExternalLink, Edit2, Trash2, CheckCircle2, Sparkles } from 'lucide-react'
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

  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const fullEventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  const startTime = new Date(`1970-01-01T${event.time_start}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const endTime = new Date(`1970-01-01T${event.time_end}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Determine the status badge
  let statusBadge = (
    <Badge variant="outline" className="bg-[#35408e]/5 text-[#35408e] border-[#35408e]/20 font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
      UPCOMING
    </Badge>
  )
  if (isOngoing) {
    statusBadge = (
      <Badge className="bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/30 flex items-center gap-1.5 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        LIVE
      </Badge>
    )
  } else if (isPast) {
    statusBadge = (
      <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-bold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full">
        COMPLETED
      </Badge>
    )
  }

  const CardInner = (
    <>
      {/* Top Badges */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex items-center gap-2">
        {isRSVPd && !isAdminView && (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            RSVP&apos;d
          </Badge>
        )}
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
            style={{ objectPosition: event.poster_position || 'center' }}
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-300" />
        )}
      </div>

      {/* Date */}
      <p className="text-gray-500 text-base md:text-lg font-medium mb-1.5 md:mb-2">
        {eventDate}
      </p>

      {/* Points */}
      <p className="text-amber-600 text-base md:text-lg font-extrabold mb-1.5 md:mb-2">
        Earn {event.points_awarded || 0} Points
      </p>

      {/* Title */}
      <h3 className="text-[#35408e] text-xl md:text-2xl font-medium mb-1.5 md:mb-2 line-clamp-2 px-3">
        {event.title}
      </h3>

      {/* Main Category Only */}
      <p className="text-gray-400 text-xs md:text-sm font-bold">
        {event.event_type || 'General'}
      </p>
    </>
  )

  const cardContainerClass = "overflow-visible text-center transition-all duration-500 bg-transparent border-0 ring-0 shadow-none outline-none hover:-translate-y-1.5 cursor-pointer group relative flex flex-col items-center p-3 md:p-6 select-none"

  if (onCardClickOverride) {
    return (
      <div 
        onClick={onCardClickOverride}
        className={cardContainerClass}
      >
        {CardInner}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        nativeButton={false}
        render={
          <div className={cardContainerClass} />
        }
      >
        {CardInner}
      </DialogTrigger>

      {/* EXPANDED MODAL (Dialog Content) */}
      <DialogContent className="max-w-3xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-white/95 backdrop-blur-3xl rounded-3xl border-white shadow-2xl flex flex-col max-h-[90vh] w-[95vw]">
        {/* Banner Section */}
        <div className="relative w-full h-40 sm:h-48 md:h-56 bg-gradient-to-br from-[#35408e]/15 via-gray-100 to-amber-50 flex items-center justify-center shrink-0">
          {event.banner_url ? (
            <Image 
              src={event.banner_url} 
              alt={event.title} 
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
              className="object-cover" 
              style={{ objectPosition: event.banner_position || 'center' }}
            />
          ) : event.poster_url ? (
            <Image 
              src={event.poster_url} 
              alt={event.title} 
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
              className="object-cover blur-sm opacity-60 scale-110" 
              style={{ objectPosition: event.poster_position || 'center' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300">
              <ImageIcon className="w-16 h-16 mb-2 text-[#35408e]/30" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">NU MOA JPIA Event</span>
            </div>
          )}
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4">
             {statusBadge}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
          <DialogHeader className="mb-6 space-y-3">
            <DialogTitle className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              {event.title}
            </DialogTitle>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full shadow-inner">
                {event.event_type || 'General'}
              </span>
              {event.themes?.map((theme: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  {theme}
                </span>
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Details Section */}
            {event.description && (
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">About this event</h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Information Grid */}
            <div className="bg-gray-50/80 rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row items-stretch justify-between gap-5 border border-gray-100">
              
              {/* When */}
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#35408e] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-gray-900">Schedule</h5>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{fullEventDate}</p>
                  <p className="text-[11px] font-medium text-gray-500">{startTime} – {endTime}</p>
                </div>
              </div>

              {/* Where */}
              {event.location && (
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#fbb03b] text-gray-900 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-gray-900">Location</h5>
                    <p className="text-xs font-medium text-gray-700 mt-0.5 whitespace-pre-wrap leading-relaxed">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Map Embed */}
              {event.location && (
                <div 
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank')}
                  className="w-full lg:w-48 min-h-[72px] rounded-xl overflow-hidden relative shadow-xs border border-gray-200 group/map cursor-pointer bg-gray-100 shrink-0"
                  title="Click to open in Google Maps"
                >
                   <iframe
                     style={{ border: 0, pointerEvents: 'none', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                     loading="lazy"
                     allowFullScreen
                     referrerPolicy="no-referrer-when-downgrade"
                     src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                   ></iframe>
                </div>
              )}
            </div>

            {/* Additional Info Row (Points & Capacity) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-amber-50/70 px-4 py-3 rounded-xl border border-amber-100 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Points Reward</p>
                  <p className="text-xs font-semibold text-amber-700">+{event.points_awarded || 0} Points</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50/70 px-4 py-3 rounded-xl border border-blue-100 shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#35408e] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Attendance Capacity</p>
                  <p className="text-xs font-semibold text-[#35408e]">
                    {event.capacity ? `${event.capacity} Attendees` : 'Unlimited'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer for RSVP or Admin Actions */}
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-20">
          <div className="text-xs text-gray-500 font-medium text-center sm:text-left">
            {!isAdminView && !isPast && (
              <span>
                {event.capacity ? 'Spaces are limited! Reserve your spot early.' : 'Open for all active members to join.'}
              </span>
            )}
            {!isAdminView && isPast && (
              <span>This event has concluded.</span>
            )}
            {isAdminView && (
              <span>Admin Management Mode</span>
            )}
          </div>
          <div className="w-full sm:w-auto flex justify-center gap-3">
             {isAdminView ? (
               <>
                 <Button 
                   variant="ghost"
                   onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDeleteAction?.(); }} 
                   className="px-5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl"
                 >
                   <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                   Delete Event
                 </Button>
                 <Button 
                   onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEditAction?.(); }} 
                   className="px-5 text-xs font-bold text-white bg-[#35408e] hover:bg-[#28316d] rounded-xl shadow-md gap-1.5"
                 >
                   <Edit2 className="w-3.5 h-3.5" /> Edit Event
                 </Button>
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
