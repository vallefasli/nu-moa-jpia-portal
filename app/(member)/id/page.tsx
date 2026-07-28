import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import QRCode from 'react-qr-code'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

export default async function DigitalIdPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch profile to get qr_token
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, student_no, program, year_level, qr_token')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] md:min-h-screen pb-24 md:pb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#35408e]/5 to-transparent -z-10" />
      
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#35408e]">My Digital ID</h1>
        <p className="text-gray-500 mt-2 text-sm font-medium">Present this QR code at JPIA events to log your attendance and earn points.</p>
      </div>

      {/* High-Contrast QR Code Wrapper */}
      <Card className="w-full bg-white shadow-[0_20px_60px_-15px_rgba(53,64,142,0.3)] border-0 ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-700 ease-out relative">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#35408e] to-[#2a3370]" />
        
        <div className="relative pt-6 px-6 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-full mx-auto flex items-center justify-center backdrop-blur-md ring-4 ring-white/30 shadow-inner mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-extrabold tracking-[0.2em] text-sm text-blue-100">OFFICIAL EVENT PASS</h2>
        </div>

        <CardContent className="p-8 pt-6 flex flex-col items-center relative z-10">
          <div className="bg-white p-5 rounded-2xl border-4 border-gray-100 shadow-xl mb-6 relative hover:scale-105 transition-transform duration-500 cursor-pointer group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#35408e]/20 via-[#fbb03b]/20 to-[#35408e]/20 blur-xl rounded-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
            <QRCode
              value={profile.qr_token}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
              level="H"
              fgColor="#111827"
              bgColor="#ffffff"
            />
          </div>

          <p className="text-[10px] text-gray-400 font-mono tracking-[0.3em] text-center mb-8 bg-gray-50 px-3 py-1.5 rounded-full uppercase">
            {profile.qr_token.split('-')[0]}
          </p>

          {/* Visual Verification Backup Card */}
          <div className="w-full pt-6 border-t-2 border-dashed border-gray-100">
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 ring-4 ring-green-50"></span>
              </span>
              <span className="text-green-600 font-extrabold text-sm tracking-[0.2em] bg-green-50 px-3 py-1 rounded-full">ACTIVE MEMBER</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#35408e] to-[#2a3370] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-4 ring-blue-50">
                {initials}
              </div>
              <div className="text-left flex-1">
                <h3 className="font-extrabold text-gray-900 text-xl tracking-tight leading-none mb-1">{profile.full_name}</h3>
                <p className="text-gray-500 font-mono text-sm tracking-wide">{profile.student_no}</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Program</p>
                <p className="font-bold text-gray-900 text-sm">{profile.program}</p>
              </div>
              <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Year</p>
                <p className="font-bold text-gray-900 text-sm">{profile.year_level}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-xs text-gray-400 mt-8 max-w-[250px] font-medium leading-relaxed animate-in fade-in duration-1000 delay-500">
        Tip: Turn up your screen brightness when scanning in low-light environments.
      </p>
    </div>
  )
}
