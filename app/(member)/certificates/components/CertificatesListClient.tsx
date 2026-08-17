'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EventRecordCard } from './EventRecordCard'

interface CertificatesListClientProps {
  earnedEvents: any[]
  feedbackMap: Record<string, any>
}

export function CertificatesListClient({ earnedEvents, feedbackMap }: CertificatesListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = earnedEvents.filter(ev => 
    ev.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus-visible:ring-[#35408e] rounded-full h-10 shadow-sm"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <Card className="border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {searchQuery ? 'No events match your search' : 'No events attended yet'}
            </h3>
            <p className="text-gray-500 max-w-sm mt-1">
              {searchQuery 
                ? 'Try adjusting your search query.' 
                : 'Attend JPIA events and make sure to scan your QR code to earn records and certificates.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEvents.map(ev => (
            <EventRecordCard 
              key={ev.id} 
              event={ev} 
              feedbackSubmitted={!!feedbackMap[ev.id]}
              feedbackData={feedbackMap[ev.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
