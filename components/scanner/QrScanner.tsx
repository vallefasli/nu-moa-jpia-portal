'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { processScan } from '@/app/(admin)/admin/scanner/actions'
import { Camera, RefreshCw, Zap, ZapOff, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QrScannerProps {
  eventId: string
  onScanComplete?: () => void
}

export function QrScanner({ eventId, onScanComplete }: QrScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([])
  const [currentCameraIdx, setCurrentCameraIdx] = useState(0)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [overlay, setOverlay] = useState<{ visible: boolean, success: boolean, data: any, message?: string }>({ visible: false, success: false, data: null })
  const scanLock = useRef(false)

  // Web Audio API feedback
  const playTone = (freq: number, type: 'sine' | 'square', duration: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn("Audio Context not supported", e)
    }
  }

  const triggerSuccessFeedback = () => {
    playTone(880, 'sine', 0.5) // High chime
    if (navigator.vibrate) navigator.vibrate([100])
  }

  const triggerErrorFeedback = () => {
    playTone(220, 'square', 0.5) // Low buzz
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
  }

  const showOverlay = (success: boolean, data: any, message?: string) => {
    setOverlay({ visible: true, success, data, message })
    setTimeout(() => {
      setOverlay(prev => ({ ...prev, visible: false }))
      scanLock.current = false // Unlock scanner
    }, 1500) // Flash for 1.5s
  }

  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isComponentMounted = useRef(true)
  
  // Cooldown map to prevent double-scanning the same user within 5 seconds
  const recentScans = useRef<{ [key: string]: number }>({})

  const eventIdRef = useRef(eventId)
  useEffect(() => {
    eventIdRef.current = eventId
  }, [eventId])

  useEffect(() => {
    isComponentMounted.current = true
    const initScanner = async () => {
      // Delay slightly to ensure DOM is fully painted
      await new Promise(r => setTimeout(r, 100))
      if (!isComponentMounted.current) return

      try {
        const html5Qrcode = new Html5Qrcode("qr-reader")
        scannerRef.current = html5Qrcode
        setScanner(html5Qrcode)

        const devices = await Html5Qrcode.getCameras()
        if (!isComponentMounted.current) return
        
        if (devices && devices.length) {
          setCameras(devices)
          startScanning(html5Qrcode, devices[0].id)
        } else {
          setCameraError("No cameras found on this device.")
        }
      } catch (err) {
        console.error("Error getting cameras", err)
        setCameraError("Could not access camera. Please check permissions.")
      }
    }
    
    initScanner()

    return () => {
      isComponentMounted.current = false
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error).finally(() => {
            scannerRef.current?.clear()
          })
        } else {
          scannerRef.current.clear()
        }
      }
    }
  }, [])

  const startScanning = async (qrInstance: Html5Qrcode, cameraId: string) => {
    try {
      if (qrInstance.isScanning) await qrInstance.stop()
      setCameraError(null)
      
      await qrInstance.start(
        cameraId,
        { 
          fps: 10, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            return { width: Math.floor(minEdge * 0.7), height: Math.floor(minEdge * 0.7) }
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          if (scanLock.current) return
          if (!eventIdRef.current) return

          // Anti-Double Scan Protection (5 second cooldown per unique QR)
          const now = Date.now()
          const lastScan = recentScans.current[decodedText]
          if (lastScan && now - lastScan < 5000) {
            scanLock.current = true
            showOverlay(false, null, 'Already scanned (Please wait 5s)')
            if (!isMuted) triggerErrorFeedback()
            return
          }

          scanLock.current = true
          recentScans.current[decodedText] = now // Log scan time

          const res = await processScan(decodedText, eventIdRef.current)
          
          if (res.success) {
            if (!isMuted) triggerSuccessFeedback()
            showOverlay(true, res.student, res.type)
            if (onScanComplete) onScanComplete()
          } else {
            if (!isMuted) triggerErrorFeedback()
            showOverlay(false, null, res.error)
          }
        },
        (error) => {
          // Ignore frequent frame scan failures
        }
      )
      
      const capabilities = qrInstance.getRunningTrackCameraCapabilities()
      if (capabilities.torchFeature().isSupported()) setTorchSupported(true)
    } catch (err) {
      console.error("Failed to start scanner:", err)
      setCameraError("Scanner failed to start. Ensure camera isn't in use by another app.")
    }
  }

  const switchCamera = () => {
    if (!scanner || cameras.length < 2) return
    const nextIdx = (currentCameraIdx + 1) % cameras.length
    setCurrentCameraIdx(nextIdx)
    startScanning(scanner, cameras[nextIdx].id)
  }

  const toggleTorch = () => {
    if (!scanner || !torchSupported) return
    const newState = !torchEnabled
    scanner.applyVideoConstraints({ advanced: [{ torch: newState } as any] })
      .then(() => setTorchEnabled(newState))
      .catch(console.error)
  }

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black ring-4 ring-gray-900 shadow-2xl">
      {/* Viewfinder */}
      <div id="qr-reader" className="w-full h-full min-h-[400px] border-none"></div>

      {/* Camera Error Overlay */}
      {cameraError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-20">
          <ZapOff className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Camera Unavailable</h3>
          <p className="text-gray-400 text-sm">{cameraError}</p>
          <Button 
            variant="outline" 
            className="mt-6 border-gray-700 text-white hover:bg-gray-800"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <Button variant="secondary" size="icon" onClick={() => setIsMuted(!isMuted)} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-none rounded-full">
          {isMuted ? <span className="text-red-400 font-bold text-xs">MUTE</span> : <span className="text-white font-bold text-xs">BEEP</span>}
        </Button>
        {cameras.length > 1 && (
          <Button variant="secondary" size="icon" onClick={switchCamera} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-none rounded-full">
            <RefreshCw className="w-5 h-5" />
          </Button>
        )}
        {torchSupported && (
          <Button variant="secondary" size="icon" onClick={toggleTorch} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-none rounded-full">
            {torchEnabled ? <Zap className="w-5 h-5 text-yellow-400" /> : <ZapOff className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {/* Event Warning */}
      {!eventId && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
          <p className="text-white font-bold tracking-widest uppercase text-sm">Select Event to Scan</p>
        </div>
      )}

      {/* Overlay Status Banner */}
      <div className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-300",
        overlay.visible ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none",
        overlay.success ? "bg-green-500/90 backdrop-blur-sm" : "bg-red-500/90 backdrop-blur-sm"
      )}>
        {overlay.success ? (
          <div className="text-center text-white animate-in zoom-in duration-300">
            <CheckCircle2 className="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
            <h2 className="text-3xl font-black tracking-tight">{overlay.data?.full_name}</h2>
            <p className="text-green-100 font-mono text-lg mt-1">{overlay.data?.student_no}</p>
            <div className="mt-6 inline-block bg-white text-green-700 px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg">
              {overlay.message === 'time_in' ? 'TIME IN' : 'TIME OUT'}
            </div>
          </div>
        ) : (
          <div className="text-center text-white animate-in zoom-in duration-300 px-4">
            <XCircle className="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
            <h2 className="text-2xl font-black tracking-tight">Scan Failed</h2>
            <p className="text-red-100 font-medium text-sm mt-2 max-w-xs mx-auto">{overlay.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
