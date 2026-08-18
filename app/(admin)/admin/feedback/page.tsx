import { createClient, getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FeedbackClient } from './FeedbackClient'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role !== 'admin' && profile?.role !== 'officer') redirect('/')

  const supabase = await createClient()

  const { data: feedbacks, error } = await supabase
    .from('feedback')
    .select(`
      id,
      type,
      message,
      status,
      created_at,
      users (
        id,
        full_name,
        first_name,
        last_name,
        student_no,
        member_id,
        committee,
        program,
        year_level,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedbacks:', error)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <FeedbackClient 
          initialFeedbacks={feedbacks || []} 
          isAdmin={profile?.role === 'admin'} 
        />
      </div>
    </div>
  )
}
