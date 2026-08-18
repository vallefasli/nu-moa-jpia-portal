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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Profile Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#35408e] to-[#2a3370] text-white flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-extrabold shadow-lg shadow-blue-900/20 ring-4 ring-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight truncate">{profile.full_name}</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1 sm:mt-2">
              <Badge variant="secondary" className="bg-[#35408e]/10 text-[#35408e] hover:bg-[#35408e]/20 font-bold text-xs">
                {profile.member_id}
              </Badge>
              <p className="text-gray-500 font-medium text-xs sm:text-sm">Student No: {profile.student_no}</p>
              {profile.committee && (
                <>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <p className="text-gray-500 font-medium text-xs sm:text-sm">{profile.committee} Committee</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Card className="bg-white/80 backdrop-blur-xl border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 bg-blue-50/80 rounded-2xl text-[#35408e] shadow-inner ring-1 ring-[#35408e]/10 shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">Events Attended</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-0.5 sm:mt-1">{attendanceCount || 0}</h2>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-xl border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#fbb03b]/10 rounded-full blur-2xl" />
          <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 relative z-10">
            <div className="p-2.5 sm:p-3.5 bg-amber-50/80 rounded-2xl text-yellow-600 shadow-inner ring-1 ring-yellow-500/20 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Points</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-0.5 sm:mt-1">{totalPoints}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Tier System */}
      <Card className="border-white bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <CardHeader className="bg-gray-50/30 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-gray-800">
            <Medal className="w-5 h-5 text-[#fbb03b]" /> Membership Tier
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Current Status</div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${currentTier.color} shadow-lg ring-2 ring-white shrink-0`} />
                <span className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-gray-900">{currentTier.name} Member</span>
              </div>
            </div>
            {currentTier.next && (
              <div className="text-left sm:text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Next Tier</div>
                <div className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-xs sm:text-sm inline-block">
                  {currentTier.max - totalPoints} pts to {currentTier.next}
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-3.5 sm:h-4 mt-4 sm:mt-6 overflow-hidden relative shadow-inner">
            <div 
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#35408e] to-[#4e5ec7] h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(53,64,142,0.5)]" 
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-white bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="border-b border-gray-100/50 p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-gray-800">
            <LogIn className="w-5 h-5 text-gray-400" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {(!recentActivity || recentActivity.length === 0) ? (
              <div className="text-center py-10 sm:py-12 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
                </div>
                <p className="text-gray-600 font-bold text-sm sm:text-base">No recent activity found.</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Attend an event to log your first Time In!</p>
              </div>
            ) : (
              recentActivity.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3.5 sm:p-5 hover:bg-gray-50/50 transition-colors group gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 ring-4 ring-green-50" />
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-[#35408e] transition-colors truncate">
                        {activity.events?.title || 'Unknown Event'}
                      </p>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5 tracking-wide">
                        {new Date(activity.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} &bull; <span className="uppercase text-gray-500">{activity.type === 'time_in' ? 'Time In' : 'Time Out'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/50 font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs shadow-sm">
                      +{activity.events?.points_awarded || 0} pts
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3.5 sm:p-4 border-t border-gray-100/50 text-center bg-gray-50/30">
            <Link href="/events" className="text-[#35408e] text-xs sm:text-sm font-bold tracking-wide hover:text-[#2a3370] transition-colors flex items-center justify-center gap-1">
              View all events 
              <span className="text-base sm:text-lg leading-none">&rsaquo;</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
