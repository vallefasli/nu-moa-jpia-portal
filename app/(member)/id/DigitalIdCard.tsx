'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Download, Sparkles } from 'lucide-react'
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
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      })
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `JPIA-Pass-${profile.member_id || profile.student_no}.png`
      downloadLink.href = dataUrl
      downloadLink.click()
    } catch (error) {
      console.error("Failed to generate pass image", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Target card for download — Classic vertical portrait ID format */}
      <div ref={cardRef} className="w-[285px] sm:w-[310px] bg-transparent p-1">
        <Card className="w-full bg-white shadow-xl shadow-black/8 border border-gray-200/90 overflow-hidden relative p-0 gap-0 rounded-2xl sm:rounded-3xl flex flex-col">
          {/* Gold top accent stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-[#FFD54F] shrink-0" />

          {/* Portrait Header */}
          <div className="relative bg-gradient-to-br from-[#004d2b] via-[#006B3C] to-[#00854a] pt-3.5 pb-3 px-4 text-center text-white overflow-hidden shrink-0">
            {/* Subtle decorative background circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/[0.04] rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/[0.04] rounded-full pointer-events-none" />

            <div className="relative z-10 w-8 h-8 rounded-xl bg-white/15 mx-auto flex items-center justify-center backdrop-blur-sm ring-1 ring-[#FFD54F]/30 shadow-xs mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFD54F]" />
            </div>
            <p className="relative z-10 text-[#FFD54F]/90 text-[8px] font-bold tracking-[0.2em] uppercase leading-none mb-1">
              National University — MOA
            </p>
            <h2 className="relative z-10 font-black tracking-wider text-xs text-white uppercase leading-tight">
              Junior Philippine Institute of Accountants
            </h2>
            <p className="relative z-10 text-white/60 text-[9px] font-semibold tracking-widest uppercase mt-0.5">
              Official Member Pass
            </p>
          </div>

          <CardContent className="p-3.5 sm:p-4 flex flex-col items-center space-y-2.5 sm:space-y-3">
            {/* Active Status Pill */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD54F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD54F]"></span>
              </span>
              <span className="text-[#FFD54F] font-black text-[9px] tracking-wider bg-[#006B3C] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                ACTIVE MEMBER
              </span>
            </div>

            {/* Member Identity Details */}
            <div className="w-full flex items-center gap-3 pt-1 border-t border-dashed border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006B3C] to-[#004d2b] flex items-center justify-center text-[#FFD54F] font-black text-sm shadow-xs ring-1 ring-[#FFD54F]/30 shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h3 className="font-black text-gray-900 text-sm leading-snug truncate">
                  {profile.full_name}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5">
                  <span className="text-[#006B3C] font-extrabold">{profile.member_id}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">{profile.student_no}</span>
                </div>
                <div className="text-[10px] text-gray-600 font-semibold truncate mt-0.5">
                  {profile.program} {profile.year_level ? `(${profile.year_level})` : ''}
                </div>
              </div>
            </div>

            {/* Centered QR Code */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200/90 shadow-xs flex flex-col items-center ring-2 ring-[#006B3C]/5">
              <QRCode
                value={profile.qr_token}
                size={125}
                style={{ height: "auto", maxWidth: "100%", width: "125px" }}
                viewBox={`0 0 256 256`}
                level="H"
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
            </div>

            {/* Monospace ID Verification Token */}
            <p className="text-[9px] text-gray-400 font-mono tracking-widest text-center px-2 py-0.5 rounded bg-gray-50 uppercase border border-gray-100">
              PASS ID: {profile.qr_token.split('-')[0]}
            </p>

            {/* Validity Footer */}
            <div className="w-full pt-1.5 border-t border-dashed border-gray-200 text-center">
              <p className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">
                NU MOA Campus • AY 2025–2026
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Button */}
      <Button
        onClick={downloadCard}
        disabled={isDownloading}
        size="sm"
        className="mt-2.5 sm:mt-3 h-9 rounded-xl text-xs font-bold px-6 bg-[#006B3C] hover:bg-[#004d2b] text-white shadow-md shadow-[#006B3C]/15 active:scale-95 transition-all gap-1.5"
      >
        <Download className="w-3.5 h-3.5" />
        {isDownloading ? 'Generating...' : 'Download Event Pass'}
      </Button>
    </div>
  )
}
