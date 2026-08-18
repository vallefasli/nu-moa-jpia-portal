import { getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, BookOpen, GraduationCap, Shield, CalendarDays, Award } from 'lucide-react'
import { ProfileUpdateModal } from './ProfileUpdateModal'

export default async function MemberProfilePage() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const profile = await getCurrentUserProfile(user.id)
  if (!profile) return null

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center mb-6 sm:mb-10 pt-2 sm:pt-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#35408e] blur-2xl opacity-20 rounded-full" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#35408e] to-[#2a3370] text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-xl ring-4 sm:ring-8 ring-white relative z-10">
            {initials}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-green-500 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-white shadow-sm z-20" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-4 sm:mt-6 leading-tight">{profile.full_name}</h1>
        <p className="text-gray-500 font-mono text-sm sm:text-base mt-1">{profile.student_no}</p>
        
        <div className="flex gap-2 mt-4 justify-center flex-wrap">
          <Badge className="bg-[#35408e]/10 text-[#35408e] hover:bg-[#35408e]/20 border-none font-bold px-4 py-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            {profile.role.toUpperCase()}
          </Badge>
          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-none font-bold px-4 py-1.5 shadow-sm">
            {profile.account_status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur-xl border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
          <CardContent className="p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Personal Details</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#35408e]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Email Address</p>
                <p className="font-semibold text-gray-900">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#35408e]">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Member Since</p>
                <p className="font-semibold text-gray-900">{memberSince}</p>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
          <CardContent className="p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Academic & Org</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#fbb03b]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Program</p>
                <p className="font-semibold text-gray-900">{profile.program}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#fbb03b]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Year Level</p>
                <p className="font-semibold text-gray-900">{profile.year_level}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#fbb03b]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Committee</p>
                <p className="font-semibold text-gray-900">{profile.committee || 'None'}</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
      
      <ProfileUpdateModal profile={profile} />
    </div>
  )
}
