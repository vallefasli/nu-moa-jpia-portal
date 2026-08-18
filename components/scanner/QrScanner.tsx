'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { processScan } from '@/app/(officer)/scanner/actions'
import { RefreshCw, Zap, ZapOff, CheckCircle2, XCircle, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QrScannerProps {
  eventId: string
  onScanComplete?: () => void
}

const isRearCamera = (device?: { id: string, label: string }) => {
  if (!device) return false
  const l = device.label.toLowerCase()
  return (
    l.includes('back') || 
    l.includes('rear') || 
    l.includes('environment') || 
    l.includes('facing back') ||
    l.includes('main') ||
    l.includes('wide') ||
    l.includes('triple') ||
    l.includes('dual')
  )
}

const isFrontCamera = (device?: { id: string, label: string }) => {
  if (!device) return true
  const l = device.label.toLowerCase()
  if (isRearCamera(device)) return false
  return (
    l.includes('front') || 
    l.includes('user') || 
    l.includes('facetime') || 
    l.includes('selfie') || 
    l.includes('integrated') || 
    l.includes('built-in')
  )
}

export function QrScanner({ eventId, onScanComplete }: QrScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([])
  const [currentCameraIdx, setCurrentCameraIdx] = useState(0)
  const [isMirrored, setIsMirrored] = useState(false)
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
    playTone(880, 'sine', 0.4) // High chime
    if (navigator.vibrate) navigator.vibrate([100])
  }

  const triggerErrorFeedback = () => {
    playTone(220, 'square', 0.4) // Low buzz
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

  const clearDomContainer = () => {
    const el = document.getElementById("qr-reader")
    if (el) {
      el.innerHTML = ""
    }
  }

  const startScanning = async (qrInstance: Html5Qrcode, cameraId: string) => {
    try {
      if (qrInstance.isScanning) {
        await qrInstance.stop()
      }
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
        (_error) => {
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

  useEffect(() => {
    let isMounted = true
    isComponentMounted.current = true

    const initScanner = async () => {
      await new Promise(r => setTimeout(r, 100))
      if (!isMounted) return

      clearDomContainer()

      try {
        const html5Qrcode = new Html5Qrcode("qr-reader")
        scannerRef.current = html5Qrcode
        setScanner(html5Qrcode)

        const devices = await Html5Qrcode.getCameras()
        if (!isMounted) {
          html5Qrcode.clear()
          return
        }
        
        if (devices && devices.length) {
          setCameras(devices)
          let defaultIdx = devices.findIndex(d => isRearCamera(d))
          if (defaultIdx === -1) defaultIdx = 0
          setCurrentCameraIdx(defaultIdx)
          setIsMirrored(isFrontCamera(devices[defaultIdx]))
          startScanning(html5Qrcode, devices[defaultIdx].id)
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
      isMounted = false
      isComponentMounted.current = false
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error).finally(() => {
            scannerRef.current?.clear()
            clearDomContainer()
          })
        } else {
          scannerRef.current.clear()
          clearDomContainer()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchCamera = () => {
    if (!scanner || cameras.length < 2) return
    const nextIdx = (currentCameraIdx + 1) % cameras.length
    setCurrentCameraIdx(nextIdx)
    setIsMirrored(isFrontCamera(cameras[nextIdx]))
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
    <div className="relative w-full max-w-[440px] mx-auto overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 shadow-xl">
      {/* Viewfinder */}
      <div 
        id="qr-reader" 
        className={cn(
          "w-full h-full min-h-[400px] border-none bg-black overflow-hidden [&_video]:object-cover [&_video]:w-full [&_video]:h-full",
          isMirrored && "[&_video]:-scale-x-100"
        )}
      />

      {/* Camera Error Overlay */}
      {cameraError && (
        <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3 border border-red-500/20">
            <ZapOff className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">Camera Unavailable</h3>
          <p className="text-gray-400 text-xs max-w-xs">{cameraError}</p>
          <Button 
            type="button"
            className="mt-5 bg-white text-gray-900 hover:bg-gray-100 font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all border-0"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-20 bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-md">
        <button 
          type="button"
          onClick={() => setIsMuted(!isMuted)} 
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isMuted ? "text-red-400 hover:bg-white/10" : "text-white/90 hover:bg-white/10"
          )}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {cameras.length > 1 && (
          <button 
            type="button"
            onClick={switchCamera} 
            title="Switch Camera"
            className="p-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {torchSupported && (
          <button 
            type="button"
            onClick={toggleTorch} 
            title={torchEnabled ? "Turn Off Flashlight" : "Turn On Flashlight"}
            className={cn(
              "p-2 rounded-lg transition-colors",
              torchEnabled ? "text-amber-300 bg-amber-400/20" : "text-white/90 hover:bg-white/10"
            )}
          >
            {torchEnabled ? <Zap className="w-4 h-4 fill-amber-300" /> : <ZapOff className="w-4 h-4" />}
          </button>
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
        overlay.success ? "bg-emerald-950/90 backdrop-blur-sm" : "bg-rose-950/90 backdrop-blur-sm"
      )}>
        {overlay.success ? (
          <div className="text-center text-white animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-emerald-400 drop-shadow-md" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{overlay.data?.full_name}</h2>
            <p className="text-emerald-200 font-mono text-base mt-1">{overlay.data?.student_no}</p>
            <div className="mt-5 inline-block bg-white text-emerald-800 px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg text-xs">
              {overlay.message === 'time_in' ? 'TIME IN' : 'TIME OUT'}
            </div>
          </div>
        ) : (
          <div className="text-center text-white animate-in zoom-in duration-300 px-4">
            <XCircle className="w-16 h-16 mx-auto mb-3 text-rose-400 drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Scan Failed</h2>
            <p className="text-rose-200 font-medium text-xs mt-2 max-w-xs mx-auto">{overlay.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
