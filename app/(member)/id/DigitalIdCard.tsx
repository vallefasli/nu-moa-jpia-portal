'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Download } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'

interface DigitalIdCardProps {
  profile: {
    full_name: string
    student_no: string
    member_id: string
    program: string
    year_level: string
    qr_token: string
  }
  initials: string
}

export default function DigitalIdCard({ profile, initials }: DigitalIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadCard = async () => {
    if (!cardRef.current) return
    
    try {
      setIsDownloading(true)
      
      // Short delay to ensure any layout shifts or initial paints are settled
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3, // High resolution for crisper image
        backgroundColor: 'transparent', // Preserves rounded corners transparency
      })
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `JPIA-ID-${profile.member_id}.png`
      downloadLink.href = dataUrl
      downloadLink.click()
    } catch (error) {
      console.error("Failed to generate image", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Target card for download */}
      <div ref={cardRef} className="w-full bg-transparent p-1">
        <Card className="w-full bg-white shadow-2xl shadow-black/10 border border-gray-200/80 overflow-hidden relative p-0 gap-0 rounded-3xl">

          {/* Gold top accent stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-[#FFD54F]" />

          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#004d2b] via-[#006B3C] to-[#00854a] pt-7 pb-8 px-5 text-center text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/[0.04] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-white/[0.04] rounded-full pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD54F]/30 to-transparent" />

            {/* Shield icon with gold color */}
            <div className="relative z-10 bg-white/15 w-14 h-14 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md ring-2 ring-[#FFD54F]/30 shadow-lg mb-3">
              <ShieldCheck className="w-7 h-7 text-[#FFD54F]" />
            </div>
            <p className="relative z-10 text-[#FFD54F]/80 text-[9px] font-bold tracking-[0.25em] uppercase mb-0.5">National University — MOA Campus</p>
            <h2 className="relative z-10 font-black tracking-widest text-sm text-white uppercase">Junior Philippine Institute of Accountants</h2>
            <p className="relative z-10 text-white/50 text-[10px] font-semibold tracking-[0.15em] uppercase mt-1">Official Member Pass</p>
          </div>

          <CardContent className="p-5 flex flex-col items-center relative z-10">
            {/* QR Code with NU Green border */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#006B3C]/20 shadow-md mb-3 relative ring-4 ring-[#006B3C]/5">
              <QRCode
                value={profile.qr_token}
                size={160}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
                level="H"
                fgColor="#111827"
                bgColor="#ffffff"
              />
            </div>

            <p className="text-[10px] text-gray-400 font-mono tracking-widest text-center mb-5 bg-gray-50 px-3 py-1 rounded-full uppercase border border-gray-100">
              {profile.qr_token.split('-')[0]}
            </p>

            {/* Member Info Section */}
            <div className="w-full pt-4 border-t border-dashed border-gray-200">
              {/* Active badge — solid green + gold text */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD54F] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFD54F]"></span>
                </span>
                <span className="text-[#FFD54F] font-black text-[10px] tracking-wider bg-[#006B3C] px-3 py-1 rounded-full uppercase shadow-sm">ACTIVE MEMBER</span>
              </div>

              {/* Identity row */}
              <div className="flex items-center gap-3">
                {/* Avatar with gold initials */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006B3C] to-[#004d2b] flex items-center justify-center text-[#FFD54F] font-black text-lg shadow-md ring-2 ring-[#FFD54F]/30 shrink-0">
                  {initials}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 text-base tracking-tight leading-none mb-1.5 truncate">{profile.full_name}</h3>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[#FFD54F] font-mono text-xs tracking-wide font-black bg-[#006B3C] px-2 py-0.5 rounded-md inline-block w-fit">{profile.member_id}</p>
                    <p className="text-gray-500 font-mono text-[9px] tracking-wide">SN: {profile.student_no}</p>
                  </div>
                </div>
              </div>

              {/* Info grid — NU Green tinted */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#006B3C]/5 rounded-xl p-2.5 border border-[#006B3C]/10">
                  <p className="text-[8px] text-[#006B3C]/60 uppercase font-black tracking-widest mb-0.5">Program</p>
                  <p className="font-bold text-gray-900 text-xs truncate">{profile.program}</p>
                </div>
                <div className="bg-[#006B3C]/5 rounded-xl p-2.5 border border-[#006B3C]/10">
                  <p className="text-[8px] text-[#006B3C]/60 uppercase font-black tracking-widest mb-0.5">Year Level</p>
                  <p className="font-bold text-gray-900 text-xs">{profile.year_level}</p>
                </div>
              </div>

              {/* Footer validity strip */}
              <div className="mt-4 bg-gradient-to-r from-[#006B3C]/8 to-[#FFD54F]/8 border border-[#006B3C]/10 rounded-xl px-3 py-2 text-center">
                <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">NU MOA Campus · AY 2025–2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Button — solid NU Green */}
      <Button
        onClick={downloadCard}
        disabled={isDownloading}
        className="mt-6 h-11 rounded-full text-sm font-bold px-8 bg-[#006B3C] hover:bg-[#004d2b] text-white shadow-lg shadow-[#006B3C]/20 active:scale-95 transition-all gap-2"
      >
        <Download className="w-4 h-4" />
        {isDownloading ? 'Generating Image...' : 'Download Event Pass'}
      </Button>
    </div>
  )
}
