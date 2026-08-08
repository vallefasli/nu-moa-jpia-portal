'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Award, ExternalLink, Clock } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

interface EventRecordCardProps {
  event: {
    id: string
    title: string
    date: string
    points_awarded: number
    certificate_link?: string
    custom_feedback_questions?: any[]
  }
  feedbackSubmitted: boolean
}

export function EventRecordCard({ event, feedbackSubmitted }: EventRecordCardProps) {
  const isPendingFeedback = !feedbackSubmitted
  const isPendingDistribution = feedbackSubmitted && !event.certificate_link
  const isCertificateReady = feedbackSubmitted && !!event.certificate_link

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#35408e]/5 to-transparent pointer-events-none" />
      <CardContent className="p-5 flex flex-col h-full relative">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-blue-50 rounded-xl text-[#35408e]">
            <Award className="w-6 h-6" />
          </div>
          <div className="px-2.5 py-1 bg-[#fbb03b]/20 text-[#fbb03b] text-xs font-bold rounded-full">
            {event.points_awarded || 0} Points
          </div>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Calendar className="w-4 h-4" />
          <span>{new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          {isPendingFeedback && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-2">Submit feedback to unlock your certificate.</p>
              <FeedbackModal 
                eventId={event.id} 
                eventTitle={event.title} 
                customQuestions={event.custom_feedback_questions || []}
              />
            </div>
          )}

          {isPendingDistribution && (
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-100 text-center space-y-1">
              <Clock className="w-5 h-5 text-gray-400 mb-1" />
              <p className="text-sm font-semibold text-gray-700">Pending Distribution</p>
              <p className="text-xs text-gray-500">Feedback received! Officers will distribute the certificate link soon.</p>
            </div>
          )}

          {isCertificateReady && (
            <a 
              href={event.certificate_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 h-10 bg-[#35408e] hover:bg-[#252d69] text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              Access Certificate
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
