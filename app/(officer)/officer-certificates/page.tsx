import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CertificatesClient } from './CertificatesClient'

export const dynamic = 'force-dynamic'

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

  // Await searchParams
  const resolvedParams = await searchParams
  const eventId = typeof resolvedParams.eventId === 'string' ? resolvedParams.eventId : null

  // 2. Fetch all events for the dropdown
  const { data: events } = await supabase
    .from('events')
    .select('id, title, status')
    .order('date', { ascending: false })

  // 3. If an event is selected, fetch feedbacks and certificates
  let feedbacks: any[] = []
  let certificates: any[] = []

  if (eventId) {
    const [feedbacksRes, certsRes] = await Promise.all([
      supabase
        .from('event_feedbacks')
        .select(`
          user_id,
          rating,
          comment,
          created_at,
          users!event_feedbacks_user_id_fkey (
            full_name,
            student_no,
            member_id
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false }),
      supabase
        .from('certificates')
        .select('user_id, template_url')
        .eq('event_id', eventId)
    ])

    if (feedbacksRes.data) feedbacks = feedbacksRes.data
    if (certsRes.data) certificates = certsRes.data
  }

  return (
    <div className="min-h-full pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Certificate Distribution</h1>
          <p className="text-gray-500 mt-1 text-sm">Review event feedback and distribute Google Drive certificate links.</p>
        </div>

        <CertificatesClient 
          events={events || []}
          selectedEventId={eventId}
          feedbacks={feedbacks}
          certificates={certificates}
        />
      </div>
    </div>
  )
}
