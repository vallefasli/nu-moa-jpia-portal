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
  const COLORS = ['#35408e', '#fbb03b', '#e5e7eb']

  const activeCount = userStats.find(s => s.name === 'Active')?.value || 0
  const pendingCount = userStats.find(s => s.name === 'Pending')?.value || 0
  const totalEvents = eventStats.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Stat Cards (Symmetric 2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Active Members */}
        <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Active Members</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#35408e]">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {activeCount}
          </div>
        </Card>

        {/* Card 2: Pending Queue */}
        <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Pending Queue</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-[#fbb03b]">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {pendingCount}
          </div>
        </Card>

        {/* Card 3: Events Hosted */}
        <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Events Hosted</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {totalEvents}
          </div>
        </Card>

        {/* Card 4: Total Check-ins */}
        <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">Total Check-ins</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {attendanceCount}
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* User Activity Pie Chart */}
        <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-1 sm:pb-3 border-b border-gray-100">
            <CardTitle className="text-sm sm:text-base font-bold text-gray-900">Member Activity</CardTitle>
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
        <Card className="border-gray-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-1 sm:pb-3 border-b border-gray-100">
            <CardTitle className="text-sm sm:text-base font-bold text-gray-900">Events by Category</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-gray-500">Distribution of event types organized</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-72 p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#35408e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table & Mobile List */}
      <Card className="border-gray-200/80 shadow-xs rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-sm sm:text-base font-bold text-gray-900">Top 10 Points Leaderboard</CardTitle>
          </div>
          <CardDescription className="text-[11px] sm:text-xs text-gray-500">Members with the most attendance and participation points</CardDescription>
        </CardHeader>

        {/* 1. Mobile Card List (< md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {leaderboard.map((user, idx) => (
            <div key={user.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                  idx === 0 ? 'bg-amber-100 text-amber-800' :
                  idx === 1 ? 'bg-slate-200 text-slate-700' :
                  idx === 2 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
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

              <span className="inline-flex items-center px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full font-bold text-[11px] shrink-0">
                {user.points} pts
              </span>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs font-medium">
              No leaderboard data recorded yet.
            </div>
          )}
        </div>

        {/* 2. Desktop Table (md+) */}
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
            <tbody className="divide-y divide-gray-100 bg-white">
              {leaderboard.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-gray-400">#{idx + 1}</td>
                  <td className="px-6 py-3.5">
                    <div className="font-bold text-gray-900 text-sm">{user.full_name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{user.student_no}</div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 text-xs">
                    {user.program} {user.year_level}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-bold text-xs">
                      {user.points} pts
                    </span>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No attendance data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  )
}
