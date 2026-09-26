import { createClient, getAuthenticatedUser } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Medal, LogIn } from 'lucide-react'
import Link from 'next/link'

function getTier(points: number) {
  if (points >= 151) return { name: 'Gold', color: 'bg-yellow-400', next: null, max: 151 }
  if (points >= 51) return { name: 'Silver', color: 'bg-gray-300', next: 'Gold', max: 151 }
  return { name: 'Bronze', color: 'bg-amber-700', next: 'Silver', max: 51 }
}

export default async function MemberDashboardPage() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const supabase = await createClient()

  // Fetch profile, total points/attendance stats, and recent activity in parallel
  const [profileRes, statsRes, activityRes] = await Promise.all([
    supabase
      .from('users')
      .select('full_name, student_no, member_id, committee')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_points_view')
      .select('total_points, events_attended')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('attendance')
      .select(`
        timestamp,
        type,
        events (
          title,
          points_awarded
        )
      `)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(3)
  ])

  const profile = profileRes.data
  if (!profile) return null

  const userStats = statsRes.data
  const attendanceCount = userStats?.events_attended || 0
  const totalPoints = userStats?.total_points || 0
  const recentActivity = activityRes.data

  const initials = profile.full_name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const currentTier = getTier(totalPoints)
  const progressPercent = currentTier.next ? (totalPoints / currentTier.max) * 100 : 100

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500">

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#004d2b] via-[#006B3C] to-[#00854a] p-5 sm:p-7 md:p-8 shadow-xl shadow-green-900/20">
        {/* Decorative background circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/[0.04] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-56 h-56 bg-white/[0.04] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD54F]/40 to-transparent" />

        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/10 border-2 border-[#FFD54F]/50 text-[#FFD54F] flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-extrabold shadow-2xl backdrop-blur-sm shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-[#FFD54F]/80 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-1">Welcome back</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate leading-tight">
              {profile.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
              <span className="inline-flex items-center bg-[#FFD54F]/15 border border-[#FFD54F]/30 text-[#FFD54F] font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full tracking-wide">
                {profile.member_id}
              </span>
              <span className="text-white/50 text-[10px] sm:text-xs font-medium">
                {profile.student_no}
              </span>
              {profile.committee && (
                <span className="hidden sm:inline-flex items-center bg-white/10 text-white/70 font-semibold text-[10px] px-2.5 py-1 rounded-full">
                  {profile.committee} Committee
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {/* Events Attended */}
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#006B3C] to-[#34a853]" />
          <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 bg-green-50 rounded-2xl text-[#006B3C] shrink-0 ring-1 ring-[#006B3C]/10">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Events Attended</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-0.5 leading-none">{attendanceCount || 0}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-[#FFD54F] to-amber-400" />
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#FFD54F]/8 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 relative z-10">
            <div className="p-2.5 sm:p-3.5 bg-amber-50 rounded-2xl text-yellow-600 shrink-0 ring-1 ring-yellow-500/20">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Points</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-0.5 leading-none">{totalPoints}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Membership Tier ── */}
      <Card className="border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-gray-800">
            <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD54F]" />
            Membership Tier
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1.5">Current Status</div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${currentTier.color} shadow-lg ring-2 ring-white shrink-0`} />
                <span className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-gray-900">{currentTier.name} Member</span>
              </div>
            </div>
            {currentTier.next && (
              <div className="text-left sm:text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1.5">Next Tier</div>
                <div className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs sm:text-sm inline-block border border-gray-200">
                  {currentTier.max - totalPoints} pts to {currentTier.next}
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 sm:h-3.5 mt-4 sm:mt-5 overflow-hidden relative shadow-inner">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#006B3C] to-[#34a853] h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_12px_rgba(0,107,60,0.4)]"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/25 to-transparent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Activity ── */}
      <Card className="border-gray-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-gray-800">
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-[#006B3C]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {(!recentActivity || recentActivity.length === 0) ? (
              <div className="text-center py-10 sm:py-12 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ring-4 ring-green-50/50">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-[#006B3C]/40" />
                </div>
                <p className="text-gray-700 font-bold text-sm sm:text-base">No recent activity yet.</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Attend an event to log your first Time In!</p>
              </div>
            ) : (
              recentActivity.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3.5 sm:p-5 hover:bg-gray-50/60 transition-colors group gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#006B3C] ring-4 ring-green-50" />
                      <div className="absolute inset-0 rounded-full bg-[#006B3C] animate-ping opacity-20" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#006B3C] transition-colors truncate">
                        {activity.events?.title || 'Unknown Event'}
                      </p>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5 tracking-wide">
                        {new Date(activity.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} &bull; <span className="uppercase text-gray-500">{activity.type === 'time_in' ? 'Time In' : 'Time Out'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="bg-green-50 text-[#006B3C] hover:bg-green-100 border border-green-200/60 font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs">
                      +{activity.events?.points_awarded || 0} pts
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3.5 sm:p-4 border-t border-gray-100/70 text-center bg-gray-50/40">
            <Link href="/events" className="text-[#006B3C] text-xs sm:text-sm font-bold tracking-wide hover:text-[#004d2b] transition-colors flex items-center justify-center gap-1">
              View all events
              <span className="text-base sm:text-lg leading-none">&rsaquo;</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
