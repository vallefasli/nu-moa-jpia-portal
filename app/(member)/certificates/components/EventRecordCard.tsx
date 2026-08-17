'use client'

import { Calendar, Award, ExternalLink, Clock, CheckCircle2 } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'
import Image from 'next/image'

interface EventRecordCardProps {
  event: {
    id: string
    title: string
    date: string
    points_awarded: number
    certificate_link?: string
    custom_feedback_questions?: any[]
    poster_url?: string
  }
  feedbackSubmitted: boolean
  feedbackData?: any
}

export function EventRecordCard({ event, feedbackSubmitted, feedbackData }: EventRecordCardProps) {
  const isPendingFeedback = !feedbackSubmitted
  const certificateLink = event.certificate_link || feedbackData?.additional_responses?.certificate_link
  const isPendingDistribution = feedbackSubmitted && !certificateLink
  const isCertificateReady = feedbackSubmitted && !!certificateLink

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-[#35408e]/30 hover:shadow-xl hover:shadow-[#35408e]/5 transition-all flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#35408e] to-[#fbb03b] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Event Details (Left Side) */}
      <div className="flex-1 flex items-start md:items-center gap-4 pl-1 sm:pl-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors relative overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-[#35408e]/20 group-hover:bg-[#35408e]/5">
          {event.poster_url ? (
            <Image 
              src={event.poster_url} 
              alt={event.title} 
              fill 
              sizes="64px"
              className="object-cover" 
            />
          ) : (
            <Award className="w-7 h-7 text-gray-400 group-hover:text-[#35408e] transition-colors" />
          )}
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl group-hover:text-[#35408e] transition-colors leading-tight mb-1.5">{event.title}</h3>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1.5 font-bold text-[#fbb03b] bg-[#fbb03b]/10 px-2.5 py-0.5 rounded-full"><Award className="w-3.5 h-3.5" /> {event.points_awarded || 0} Points</span>
          </div>
        </div>
      </div>

      {/* Action / Status (Right Side) */}
      <div className="md:w-64 flex-shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 pl-1 sm:pl-0">
        {isPendingFeedback && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider hidden md:block">Action Required</p>
            <FeedbackModal 
              eventId={event.id} 
              eventTitle={event.title} 
              customQuestions={event.custom_feedback_questions || []}
            />
          </div>
        )}

        {isPendingDistribution && (
          <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-gray-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 leading-tight">Pending Distribution</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Officers will provide the link soon.</p>
            </div>
          </div>
        )}

        {isCertificateReady && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 hidden md:flex"><CheckCircle2 className="w-3.5 h-3.5" /> Certificate Ready</p>
            <a 
              href={certificateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold transition-colors shadow-sm group/btn"
            >
              <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              Access Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
