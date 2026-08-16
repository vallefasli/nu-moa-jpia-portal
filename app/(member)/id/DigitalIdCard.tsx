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
        <Card className="w-full bg-white shadow-xl border border-gray-100 overflow-hidden relative p-0 gap-0">
          <div className="relative bg-gradient-to-b from-[#35408e] to-[#2a3370] pt-6 pb-6 px-4 text-center text-white">
            <div className="bg-white/20 w-12 h-12 rounded-full mx-auto flex items-center justify-center backdrop-blur-md ring-2 ring-white/30 shadow-inner mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-bold tracking-widest text-[11px] text-blue-100 uppercase">OFFICIAL EVENT PASS</h2>
          </div>

          <CardContent className="p-5 flex flex-col items-center relative z-10">
            <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-md mb-4 relative">
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
            
            <p className="text-[10px] text-gray-400 font-mono tracking-widest text-center mb-5 bg-gray-50 px-3 py-1 rounded-full uppercase">
              {profile.qr_token.split('-')[0]}
            </p>

            {/* Visual Verification Backup Card */}
            <div className="w-full pt-4 border-t border-dashed border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 ring-2 ring-green-50"></span>
                </span>
                <span className="text-green-600 font-bold text-[10px] tracking-wider bg-green-50 px-2 py-0.5 rounded-full uppercase">ACTIVE MEMBER</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#35408e] to-[#2a3370] flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-blue-50 shrink-0">
                  {initials}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base tracking-tight leading-none mb-1 truncate">{profile.full_name}</h3>
                  <div className="flex flex-col">
                    <p className="text-[#35408e] font-mono text-xs tracking-wide font-semibold">{profile.member_id}</p>
                    <p className="text-gray-500 font-mono text-[9px] tracking-wide">SN: {profile.student_no}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50/80 rounded-lg p-2 border border-gray-100">
                  <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Program</p>
                  <p className="font-semibold text-gray-900 text-xs truncate">{profile.program}</p>
                </div>
                <div className="bg-gray-50/80 rounded-lg p-2 border border-gray-100">
                  <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Year</p>
                  <p className="font-semibold text-gray-900 text-xs">{profile.year_level}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={downloadCard}
        variant="outline"
        disabled={isDownloading}
        className="mt-8 h-10 rounded-full text-sm font-semibold px-6 border-[#35408e]/20 text-[#35408e] hover:bg-[#35408e]/5 shadow-sm"
      >
        <Download className="w-4 h-4 mr-2" />
        {isDownloading ? 'Generating Image...' : 'Download Event Pass'}
      </Button>
    </div>
  )
}
