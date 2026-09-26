'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Trophy, Activity, Users, Star, CheckCircle2 } from 'lucide-react'

export function AnalyticsClient({ 
  userStats, 
  eventStats, 
  attendanceCount = 0,
  leaderboard 
}: { 
  userStats: any[], 
  eventStats: any[], 
  attendanceCount?: number,
  leaderboard: any[] 
}) {
  const COLORS = ['#006B3C', '#FFD54F', '#e5e7eb']

  const activeCount = userStats.find(s => s.name === 'Active')?.value || 0
  const pendingCount = userStats.find(s => s.name === 'Pending')?.value || 0
  const totalEvents = eventStats.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">

        {/* Card 1: Active Members */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-[#006B3C] to-[#34a853]" />
          <div className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Active Members</span>
              <div className="p-1.5 rounded-lg bg-green-50 text-[#006B3C]">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-none">{activeCount}</div>
          </div>
        </Card>

        {/* Card 2: Pending Queue */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-[#FFD54F] to-amber-400" />
          <div className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Pending Queue</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-none">{pendingCount}</div>
          </div>
        </Card>

        {/* Card 3: Events Hosted */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-[#006B3C]/60 to-emerald-400" />
          <div className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Events Hosted</span>
              <div className="p-1.5 rounded-lg bg-green-50 text-[#006B3C]">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-none">{totalEvents}</div>
          </div>
        </Card>

        {/* Card 4: Total Check-ins */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col justify-between">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
          <div className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Total Check-ins</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-none">{attendanceCount}</div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* User Activity Pie Chart */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-1 sm:pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#006B3C]" />
              <CardTitle className="text-sm sm:text-base font-bold text-gray-900">Member Activity</CardTitle>
            </div>
            <CardDescription className="text-[11px] sm:text-xs text-gray-500">Active vs pending accounts ratio</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-72 p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Turnout Bar Chart */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-1 sm:pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#006B3C]" />
              <CardTitle className="text-sm sm:text-base font-bold text-gray-900">Events by Category</CardTitle>
            </div>
            <CardDescription className="text-[11px] sm:text-xs text-gray-500">Distribution of event types organized</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-72 p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f0fdf4' }} />
                <Bar dataKey="count" fill="#006B3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50/80 to-white border-b border-gray-100 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFD54F]" />
            <CardTitle className="text-sm sm:text-base font-bold text-gray-900">Top 10 Points Leaderboard</CardTitle>
          </div>
          <CardDescription className="text-[11px] sm:text-xs text-gray-500">Members with the most attendance and participation points</CardDescription>
        </CardHeader>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-gray-50">
          {leaderboard.map((user, idx) => (
            <div key={user.id} className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${idx === 0 ? 'bg-amber-50/40' : idx === 1 ? 'bg-slate-50/60' : idx === 2 ? 'bg-orange-50/30' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 shadow-sm ${
                  idx === 0 ? 'bg-amber-400 text-white shadow-amber-200' :
                  idx === 1 ? 'bg-slate-400 text-white shadow-slate-200' :
                  idx === 2 ? 'bg-amber-700 text-white shadow-amber-100' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 truncate">{user.full_name}</div>
                  <div className="text-[10px] text-gray-400 font-medium truncate">
                    {user.program} · {user.year_level}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FFD54F]/20 text-amber-800 border border-[#FFD54F]/40 rounded-full font-bold text-[11px] shrink-0">
                {user.points} pts
              </span>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs font-medium">No leaderboard data recorded yet.</div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Rank</th>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Program</th>
                <th className="px-6 py-3 text-right rounded-tr-lg">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {leaderboard.map((user, idx) => (
                <tr key={user.id} className={`transition-colors ${
                  idx === 0 ? 'bg-amber-50/50 hover:bg-amber-50' :
                  idx === 1 ? 'bg-slate-50/50 hover:bg-slate-50' :
                  idx === 2 ? 'bg-orange-50/30 hover:bg-orange-50/50' :
                  'hover:bg-green-50/30'
                }`}>
                  <td className="px-6 py-3.5">
                    <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shadow-sm ${
                      idx === 0 ? 'bg-amber-400 text-white' :
                      idx === 1 ? 'bg-slate-400 text-white' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-bold text-gray-900 text-sm">{user.full_name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{user.student_no}</div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 text-xs">{user.program} {user.year_level}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-[#FFD54F]/20 text-amber-800 border border-[#FFD54F]/40 rounded-full font-bold text-xs">
                      {user.points} pts
                    </span>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No attendance data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
