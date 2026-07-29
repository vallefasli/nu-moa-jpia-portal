import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Calendar, Download } from 'lucide-react'

export default async function CertificatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Fetch all events where the user has a "time_in" record
  const { data: attendanceLogs } = await supabase
    .from('attendance')
    .select(`
      event_id,
      timestamp,
      events ( id, title, date, points_awarded )
    `)
    .eq('user_id', user.id)
    .eq('type', 'time_in')
    .order('timestamp', { ascending: false })

  // Remove duplicates in case they somehow got multiple time_in for the same event
  const uniqueEvents = new Map()
  attendanceLogs?.forEach(log => {
    if (!uniqueEvents.has(log.event_id) && log.events) {
      uniqueEvents.set(log.event_id, log.events)
    }
  })
  
  const earnedCertificates = Array.from(uniqueEvents.values())

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Certificates</h1>
        <p className="text-gray-500 mt-1">Download and share your earned event certificates.</p>
      </div>

      {earnedCertificates.length === 0 ? (
        <Card className="border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No certificates yet</h3>
            <p className="text-gray-500 max-w-sm mt-1">Attend JPIA events and make sure to scan your QR code to earn certificates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {earnedCertificates.map(ev => (
            <Card key={ev.id} className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#35408e]/5 to-transparent pointer-events-none" />
              <CardContent className="p-5 flex flex-col h-full relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#35408e]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="px-2.5 py-1 bg-[#fbb03b]/20 text-[#fbb03b] text-xs font-bold rounded-full">
                    {ev.points_awarded || 0} Points
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
                  {ev.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(ev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <div className="mt-auto">
                  <Link 
                    href={`/certificates/${ev.id}`}
                    className="flex w-full items-center justify-center gap-2 h-10 bg-gray-900 hover:bg-[#35408e] text-white rounded-lg font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
