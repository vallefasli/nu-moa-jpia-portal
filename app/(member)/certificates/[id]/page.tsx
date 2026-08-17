import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CertificateGenerator } from './CertificateGenerator'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CertificateViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Verify they attended the event fully (has a time_out)
  const { data: attendanceLogs } = await supabase
    .from('attendance')
    .select('type')
    .eq('user_id', user.id)
    .eq('event_id', params.id)

  const hasTimeOut = attendanceLogs?.some(log => log.type === 'time_out')

  if (!hasTimeOut) {
    redirect('/certificates') // Not authorized to view certificate
  }

  // Fetch Event Details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  // Fetch User Details
  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (!event || !profile) redirect('/certificates')

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/certificates" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Certificate of Completion</h1>
          <p className="text-gray-500 mt-1">{event.title}</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col items-center justify-center p-4 relative">
        <CertificateGenerator 
          studentName={profile.full_name}
          eventTitle={event.title}
          date={new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        />
      </div>
    </div>
  )
}
