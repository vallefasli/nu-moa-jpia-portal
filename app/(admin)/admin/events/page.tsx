import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EventManagementClient } from './EventManagementClient'

export default async function EventsPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin' && profile?.role !== 'officer') redirect('/')

  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*, event_rsvps(count)')
    .order('date', { ascending: false })
    .order('time_start', { ascending: false })

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Event Management</h1>
            <p className="text-gray-500 mt-1">Create, edit, and manage all organization events.</p>
          </div>
        </div>

        <EventManagementClient events={events || []} isAdmin={profile?.role === 'admin'} />
      </div>
    </div>
  )
}
