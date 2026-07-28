import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, BookOpen, GraduationCap, Shield, CalendarDays, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function MemberProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center mb-10 pt-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#35408e] blur-2xl opacity-20 rounded-full" />
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#35408e] to-[#2a3370] text-white flex items-center justify-center text-4xl font-extrabold shadow-xl ring-8 ring-white relative z-10">
            {initials}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm z-20" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-6 tracking-tight">{profile.full_name}</h1>
        <p className="text-gray-500 font-mono text-base mt-1">{profile.student_no}</p>
        
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
      
      <div className="text-center mt-12">
        <Button variant="outline" className="border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full px-8">
          Request Profile Update
        </Button>
        <p className="text-xs text-gray-400 mt-3 font-medium">To change your personal details, please contact an Administrator.</p>
      </div>
    </div>
  )
}
