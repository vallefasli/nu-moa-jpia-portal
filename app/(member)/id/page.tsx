import { createClient } from '@/utils/supabase/server'
import DigitalIdCard from './DigitalIdCard'

export default async function DigitalIdPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch profile to get qr_token and member_id
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, student_no, member_id, program, year_level, qr_token')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="w-full max-w-sm mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#35408e]/5 to-transparent -z-10" />
      
      <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Digital ID</h1>
        <p className="text-gray-500 mt-1 text-sm">Present this QR code at JPIA events to log your attendance and earn points.</p>
      </div>

      <DigitalIdCard profile={profile} initials={initials} />
      
      <p className="text-center text-[10px] text-gray-400 mt-6 max-w-[200px] font-medium leading-relaxed animate-in fade-in duration-1000 delay-500">
        Tip: Turn up your screen brightness when scanning in low-light environments.
      </p>
    </div>
  )
}
