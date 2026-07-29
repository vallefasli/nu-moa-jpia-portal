'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export function CertificateGenerator({ 
  studentName, 
  eventTitle, 
  date 
}: { 
  studentName: string
  eventTitle: string
  date: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Load the base template image
    const image = new Image()
    image.src = '/certificate-template.jpg' // Use the generated template
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      // Set canvas dimensions to match the template for high-res output
      canvas.width = image.width
      canvas.height = image.height

      // Draw base image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      // Configure text styles
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 1. Draw "CERTIFICATE OF COMPLETION" (if not already in the template)
      ctx.fillStyle = '#2a3370' // Dark blue
      ctx.font = 'bold 60px "Inter", sans-serif'
      ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, canvas.height * 0.3)

      // 2. Draw "This is presented to"
      ctx.fillStyle = '#6b7280'
      ctx.font = '30px "Inter", sans-serif'
      ctx.fillText('This is presented to', canvas.width / 2, canvas.height * 0.4)

      // 3. Draw Student Name (Big, elegant font)
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 80px "Inter", sans-serif'
      ctx.fillText(studentName.toUpperCase(), canvas.width / 2, canvas.height * 0.52)

      // Draw underline for name
      ctx.beginPath()
      ctx.moveTo(canvas.width * 0.2, canvas.height * 0.58)
      ctx.lineTo(canvas.width * 0.8, canvas.height * 0.58)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.stroke()

      // 4. Draw Event Title
      ctx.fillStyle = '#4b5563'
      ctx.font = 'italic 35px "Inter", sans-serif'
      ctx.fillText('For successfully attending and participating in', canvas.width / 2, canvas.height * 0.65)
      
      ctx.fillStyle = '#fbb03b' // JPIA Gold
      ctx.font = 'bold 45px "Inter", sans-serif'
      ctx.fillText(eventTitle, canvas.width / 2, canvas.height * 0.72)

      // 5. Draw Date
      ctx.fillStyle = '#6b7280'
      ctx.font = '25px "Inter", sans-serif'
      ctx.fillText(`Issued on ${date}`, canvas.width / 2, canvas.height * 0.82)

      // Extract to Data URL
      setDataUrl(canvas.toDataURL('image/jpeg', 0.9))
      setIsGenerating(false)
    }

    image.onerror = () => {
      console.error("Failed to load certificate template")
      setIsGenerating(false)
    }

  }, [studentName, eventTitle, date])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `JPIA_Certificate_${studentName.replace(/\s+/g, '_')}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full max-w-4xl bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative aspect-[1.414/1] flex items-center justify-center">
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 text-[#35408e] animate-spin mb-2" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Rendering Certificate...</p>
          </div>
        )}
        
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-contain"
          style={{ opacity: isGenerating ? 0 : 1, transition: 'opacity 0.5s ease' }}
        />
      </div>

      <Button 
        onClick={handleDownload} 
        disabled={isGenerating || !dataUrl}
        className="h-12 px-8 bg-gradient-to-r from-[#35408e] to-[#2a3370] hover:from-[#2a3370] hover:to-[#1a2350] text-white shadow-lg shadow-blue-900/20 text-lg font-bold min-w-[250px]"
      >
        <Download className="w-5 h-5 mr-2" />
        Download High-Res
      </Button>
    </div>
  )
}
