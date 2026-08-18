'use client'

import { useState, useTransition, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Image as ImageIcon, Upload, X, MapPin, 
  Users, Trash2, Calendar, Clock, FileText, Share2, Eye, ExternalLink, RefreshCw, CheckCircle2, ChevronRight, ListChecks, ArrowLeft,
  Search, Trash, ImageIcon as BannerIcon, Move, RotateCcw
} from 'lucide-react'
import { createEvent, updateEvent, deleteEvent } from './actions'
import { getEventStatus } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { EventCardClient } from '../../../(member)/events/EventCardClient'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function parsePosition(pos: string): { x: number, y: number } {
  if (!pos || pos === 'center') return { x: 50, y: 50 }
  if (pos === 'top') return { x: 50, y: 0 }
  if (pos === 'bottom') return { x: 50, y: 100 }
  if (pos === 'left') return { x: 0, y: 50 }
  if (pos === 'right') return { x: 100, y: 50 }
  
  const parts = pos.split(' ').map(p => parseFloat(p.replace('%', '')))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { x: parts[0], y: parts[1] }
  }
  return { x: 50, y: 50 }
}

function ImageFocalAdjuster({
  label,
  aspect,
  preview,
  position,
  onPositionChange,
  onFileSelect,
  sizeNote
}: {
  label: string
  aspect: 'circle' | 'banner'
  preview: string | null
  position: string
  onPositionChange: (pos: string) => void
  onFileSelect: () => void
  sizeNote: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const currentPos = parsePosition(position)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!preview) {
      onFileSelect()
      return
    }
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startPosX = currentPos.x
    const startPosY = currentPos.y

    setIsDragging(true)
    container.setPointerCapture(e.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100

      const newX = Math.min(100, Math.max(0, Math.round(startPosX - deltaX)))
      const newY = Math.min(100, Math.max(0, Math.round(startPosY - deltaY)))
      onPositionChange(`${newX}% ${newY}%`)
    }

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false)
      try {
        container.releasePointerCapture(upEvent.pointerId)
      } catch {}
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const resetToCenter = () => {
    onPositionChange('50% 50%')
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-bold text-gray-900">{label}</label>
        <p className="text-[11px] text-gray-500">{sizeNote}</p>
      </div>

      {/* Image Preview / Drag Area */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className={`relative overflow-hidden group select-none ${
          aspect === 'circle' 
            ? 'aspect-square w-full max-w-[170px] mx-auto rounded-full border-2 border-dashed border-gray-200 bg-gray-50 shadow-sm' 
            : 'aspect-[21/9] w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 shadow-sm'
        } ${
          preview 
            ? isDragging ? 'cursor-grabbing border-blue-500' : 'cursor-grab hover:border-gray-300' 
            : 'cursor-pointer hover:bg-gray-100'
        } transition-all flex flex-col items-center justify-center`}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt={label} 
              draggable={false}
              className={`w-full h-full object-cover pointer-events-none ${isDragging ? 'transition-none' : 'transition-[object-position] duration-75'}`}
              style={{ objectPosition: position || '50% 50%' }}
            />

            {/* Hover Drag Hint */}
            <div className={`absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity ${
              isDragging ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <div className="bg-black/60 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                <Move className="w-3.5 h-3.5" />
                {isDragging ? 'Dragging...' : 'Drag to adjust'}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-3 pointer-events-none">
            {aspect === 'circle' ? (
              <ImageIcon className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
            ) : (
              <BannerIcon className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
            )}
            <span className="text-[11px] text-gray-500 font-bold block">Upload Image</span>
          </div>
        )}
      </div>

      {/* Action Links */}
      {preview && (
        <div className="flex items-center justify-between text-xs pt-0.5 px-1">
          <button
            type="button"
            onClick={onFileSelect}
            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
          >
            <Upload className="w-3 h-3" /> Change
          </button>
          <button
            type="button"
            onClick={resetToCenter}
            className="text-gray-500 hover:text-gray-800 font-semibold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset position
          </button>
        </div>
      )}
    </div>
  )
}

export function EventManagementClient({ events, isAdmin }: { events: any[], isAdmin: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const predefinedTypes = ['General', 'Academic', 'Social', 'Community']
  const [categorySelect, setCategorySelect] = useState('General')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [customQuestions, setCustomQuestions] = useState<any[]>([])
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  
  // Custom Themes State
  const [themes, setThemes] = useState<string[]>([])
  const [themeInput, setThemeInput] = useState('')
  
  // Image Upload State
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPosition, setPosterPosition] = useState('center')
  
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPosition, setBannerPosition] = useState('center')

  const [isUploading, setIsUploading] = useState(false)
  
  const posterInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationInput, setLocationInput] = useState('')

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
  
  const supabase = createClient()

  const handleOpenModal = (event: any = null) => {
    setEditingEvent(event)
    setCustomQuestions(event?.custom_feedback_questions || [])
    setThemes(event?.themes || [])
    setThemeInput('')
    setLocationInput(event?.location || '')
    setPosterPreview(event?.poster_url || null)
    setPosterFile(null)
    setPosterPosition(event?.poster_position || 'center')
    setBannerPreview(event?.banner_url || null)
    setBannerFile(null)
    setBannerPosition(event?.banner_position || 'center')
    const initialType = event?.event_type || 'General'
    setCategorySelect(predefinedTypes.includes(initialType) ? initialType : 'Other')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingEvent(null)
    setCustomQuestions([])
    setThemes([])
    setThemeInput('')
    setLocationInput('')
    setPosterPreview(null)
    setPosterFile(null)
    setPosterPosition('center')
    setBannerPreview(null)
    setBannerFile(null)
    setBannerPosition('center')
    setCategorySelect('General')
    setIsModalOpen(false)
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Image size should be less than 1MB')
        return
      }
      setFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File | null, existingUrl: string | null): Promise<string | null> => {
    if (!file) return existingUrl || null;

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-posters')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      toast.error('Failed to upload image. Please ensure storage is configured.')
      return existingUrl || null;
    }

    const { data: { publicUrl } } = supabase.storage.from('event-posters').getPublicUrl(filePath)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('custom_feedback_questions', JSON.stringify(customQuestions))
    formData.append('themes', JSON.stringify(themes))
    formData.append('poster_position', posterPosition)
    formData.append('banner_position', bannerPosition)
    
    setIsUploading(true)
    const [uploadedPosterUrl, uploadedBannerUrl] = await Promise.all([
      uploadImage(posterFile, editingEvent?.poster_url),
      uploadImage(bannerFile, editingEvent?.banner_url)
    ])
    
    if (uploadedPosterUrl) formData.append('poster_url', uploadedPosterUrl)
    if (uploadedBannerUrl) formData.append('banner_url', uploadedBannerUrl)
      
    setIsUploading(false)
    
    startTransition(async () => {
      let res;
      if (editingEvent) {
        res = await updateEvent(editingEvent.id, formData)
      } else {
        res = await createEvent(formData)
      }

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(editingEvent ? 'Event updated!' : 'Event created!')
        handleCloseModal()
        router.refresh()
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!isAdmin) return toast.error("Only Admins can delete events")
    setEventToDelete(id)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) return
    const id = eventToDelete
    setEventToDelete(null)

    startTransition(async () => {
      const res = await deleteEvent(id)
      if (res.error) toast.error(res.error)
      else {
        toast.success('Event deleted')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus-visible:ring-[#35408e] rounded-xl h-10 shadow-xs text-sm"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#fbb03b] hover:bg-[#e09e35] text-black font-bold shadow-sm rounded-xl px-5 h-10 shrink-0 active:scale-95 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map(ev => {
          const effectiveStatus = getEventStatus(ev)
          return (
            <div key={ev.id} className="relative">
              <EventCardClient 
                event={ev} 
                isOngoing={effectiveStatus === 'ongoing'} 
                isPast={effectiveStatus === 'completed'}
                isAdminView={true}
                onEditAction={() => handleOpenModal(ev)}
                onDeleteAction={() => handleDelete(ev.id)}
              />
            </div>
          )
        })}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300">
            <ImageIcon className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search query.' : 'Create your first event to get started.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenModal()} className="bg-[#fbb03b] hover:bg-[#e09e35] text-black font-bold rounded-xl shadow-sm">
                Create Event
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300"
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg sm:text-2xl font-black text-gray-900">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button type="button" onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
              
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Images Column */}
                  <div className="space-y-4 lg:col-span-1">
                    {/* Circle Poster Adjuster */}
                    <ImageFocalAdjuster
                      label="Circle Poster"
                      aspect="circle"
                      preview={posterPreview}
                      position={posterPosition}
                      onPositionChange={setPosterPosition}
                      onFileSelect={() => posterInputRef.current?.click()}
                      sizeNote="1:1 Square (e.g. 500×500 px), Max 1MB"
                    />
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      ref={posterInputRef} 
                      onChange={(e) => handleImageChange(e, setPosterFile, setPosterPreview)}
                      className="hidden" 
                    />

                    {/* Wide Banner Adjuster */}
                    <ImageFocalAdjuster
                      label="Wide Banner"
                      aspect="banner"
                      preview={bannerPreview}
                      position={bannerPosition}
                      onPositionChange={setBannerPosition}
                      onFileSelect={() => bannerInputRef.current?.click()}
                      sizeNote="21:9 Wide (e.g. 1200×500 px), Max 1MB"
                    />
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      ref={bannerInputRef} 
                      onChange={(e) => handleImageChange(e, setBannerFile, setBannerPreview)}
                      className="hidden" 
                    />
                  </div>

                  {/* Details Column */}
                  <div className="space-y-4 sm:space-y-5 lg:col-span-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">Event Title</label>
                      <Input name="title" defaultValue={editingEvent?.title} required placeholder="e.g. Google I/O Manila 2026" className="bg-gray-50/70 border-gray-200 h-10 text-xs sm:text-sm rounded-xl" />
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">Description</label>
                      <textarea 
                        name="description" 
                        defaultValue={editingEvent?.description} 
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-xs sm:text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35408e]/20 transition-all resize-none" 
                        placeholder="Provide details about the event..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">Location</label>
                        <Input 
                          name="location" 
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          required 
                          placeholder="e.g. One Ayala, Makati" 
                          className="bg-gray-50/70 border-gray-200 h-10 text-xs sm:text-sm rounded-xl" 
                        />
                        {locationInput.trim() && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationInput.trim())}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-24 relative bg-gray-100 block transition-all hover:border-[#35408e]/50 hover:shadow-md cursor-pointer"
                            title="Click to view in Google Maps"
                          >
                            <iframe
                              style={{ border: 0, pointerEvents: 'none', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(locationInput.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            />
                          </a>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">Base Category</label>
                        <select 
                          name={categorySelect === 'Other' ? "dummy_event_type" : "event_type"} 
                          value={categorySelect}
                          onChange={(e) => setCategorySelect(e.target.value)}
                          className={`w-full h-10 rounded-xl border border-gray-200 bg-gray-50/70 px-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35408e]/20 ${categorySelect === 'Other' ? 'mb-2' : ''}`}
                        >
                          <option value="General">General Assembly</option>
                          <option value="Academic">Academic</option>
                          <option value="Social">Social</option>
                          <option value="Community">Community</option>
                          <option value="Other">Other (Custom)</option>
                        </select>
                        {categorySelect === 'Other' && (
                          <Input 
                            name="event_type" 
                            defaultValue={predefinedTypes.includes(editingEvent?.event_type) ? '' : editingEvent?.event_type} 
                            required 
                            placeholder="Type custom category..." 
                            className="bg-white border-gray-200 h-10 text-xs sm:text-sm rounded-xl w-full"
                          />
                        )}
                      </div>
                    </div>

                    {/* Custom Themes */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">Custom Themes / Tags</label>
                      <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#35408e]/20 transition-all">
                        <div className="flex flex-wrap gap-1.5 mb-1.5 px-1">
                          {themes.map(t => (
                            <span key={t} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              {t}
                              <button type="button" onClick={() => setThemes(themes.filter(theme => theme !== t))} className="hover:text-red-600 hover:bg-white rounded-full p-0.5 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <Input 
                          value={themeInput} 
                          onChange={e => setThemeInput(e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const newTheme = themeInput.trim()
                              if (newTheme && !themes.includes(newTheme)) {
                                setThemes([...themes, newTheme])
                                setThemeInput('')
                              }
                            }
                          }}
                          placeholder="Type tag (e.g. AI, Workshop) & press Enter..." 
                          className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-7 text-xs px-1" 
                        />
                      </div>
                    </div>

                    {/* Modern Event Schedule Card */}
                    <div className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5 text-[#35408e]" />
                          <span>Event Schedule</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Event Date */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#35408e] pointer-events-none" />
                            <Input 
                              type="date" 
                              name="date" 
                              defaultValue={editingEvent?.date} 
                              required 
                              className="pl-9 bg-white border-gray-200 h-10 text-xs sm:text-sm rounded-xl font-medium shadow-xs" 
                            />
                          </div>
                        </div>

                        {/* Start Time */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Start Time
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600 pointer-events-none" />
                            <Input 
                              type="time" 
                              name="time_start" 
                              defaultValue={editingEvent?.time_start || '09:00'} 
                              required 
                              className="pl-8 bg-white border-gray-200 h-10 text-xs sm:text-sm rounded-xl font-medium shadow-xs cursor-pointer" 
                            />
                          </div>
                        </div>

                        {/* End Time */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            End Time
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-600 pointer-events-none" />
                            <Input 
                              type="time" 
                              name="time_end" 
                              defaultValue={editingEvent?.time_end || '17:00'} 
                              required 
                              className="pl-8 bg-white border-gray-200 h-10 text-xs sm:text-sm rounded-xl font-medium shadow-xs cursor-pointer" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & Points & Status Box */}
                    <div className={`grid grid-cols-2 ${editingEvent ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100`}>
                      {editingEvent && (
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status Override</label>
                          <select name="status" defaultValue={editingEvent?.status || 'upcoming'} className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35408e]/20">
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      )}
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Capacity</label>
                        <Input type="number" name="capacity" defaultValue={editingEvent?.capacity} placeholder="No limit" className="bg-white border-gray-200 h-10 text-xs sm:text-sm rounded-xl" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Points</label>
                        <Input type="number" name="points_awarded" defaultValue={editingEvent?.points_awarded || 0} required min="0" className="bg-white border-gray-200 h-10 text-xs sm:text-sm rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Feedback Questions */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <label className="block text-xs sm:text-sm font-bold text-gray-900">Custom Feedback Questions</label>
                      {customQuestions.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full">
                          {customQuestions.length} {customQuestions.length === 1 ? 'Question' : 'Questions'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">Optional</span>
                  </div>

                  {customQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {customQuestions.map((cq, index) => (
                        <div key={cq.id} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs transition-all space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-[#35408e]/10 text-[#35408e] text-[10px] font-black flex items-center justify-center">
                                Q{index + 1}
                              </span>
                              <span className="text-xs font-bold text-gray-700">Question {index + 1}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== index))}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors p-1 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <Input 
                              value={cq.question}
                              onChange={(e) => {
                                const newQs = [...customQuestions]
                                newQs[index].question = e.target.value
                                setCustomQuestions(newQs)
                              }}
                              placeholder="Question Title (e.g., How would you rate the speaker?)"
                              className="bg-gray-50/80 h-10 flex-1 rounded-xl text-xs sm:text-sm font-semibold"
                              required
                            />
                            <select 
                              value={cq.type}
                              onChange={(e) => {
                                const newQs = [...customQuestions]
                                newQs[index].type = e.target.value
                                if (['multiple_choice', 'checkboxes', 'dropdown'].includes(e.target.value) && (!newQs[index].options || newQs[index].options.length === 0)) {
                                  newQs[index].options = ['Option 1']
                                } else if (e.target.value === 'rating' && (!newQs[index].options || newQs[index].options.length !== 2)) {
                                  newQs[index].options = ['', '']
                                }
                                setCustomQuestions(newQs)
                              }}
                              className="h-10 w-full sm:w-44 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35408e]/20"
                            >
                              <option value="text_short">Short Answer</option>
                              <option value="text_long">Paragraph</option>
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="checkboxes">Checkboxes</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="rating">Linear Scale (1-5)</option>
                              <option value="text" className="hidden">Short Answer</option>
                            </select>
                          </div>

                          {/* Options Builder for Multiple Choice / Checkboxes / Dropdown */}
                          {['multiple_choice', 'checkboxes', 'dropdown'].includes(cq.type) && (
                            <div className="space-y-2 pl-2 pt-1 border-t border-gray-100">
                              {cq.options?.map((opt: string, optIndex: number) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  {cq.type === 'multiple_choice' ? <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" /> :
                                  cq.type === 'checkboxes' ? <div className="w-3.5 h-3.5 rounded-[4px] border-2 border-gray-300 shrink-0" /> :
                                  <span className="text-gray-400 font-bold text-xs w-4 text-center">{optIndex + 1}.</span>}
                                  <Input 
                                    value={opt}
                                    onChange={(e) => {
                                      const newQs = [...customQuestions]
                                      newQs[index].options[optIndex] = e.target.value
                                      setCustomQuestions(newQs)
                                    }}
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="h-8 border-0 border-b border-gray-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#35408e] flex-1 shadow-none text-xs"
                                  />
                                  {cq.options.length > 1 && (
                                    <button type="button" onClick={() => {
                                      const newQs = [...customQuestions]
                                      newQs[index].options.splice(optIndex, 1)
                                      setCustomQuestions(newQs)
                                    }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <div className="flex items-center gap-2 pt-1">
                                <button type="button" onClick={() => {
                                  const newQs = [...customQuestions]
                                  if (!newQs[index].options) newQs[index].options = []
                                  newQs[index].options.push(`Option ${newQs[index].options.length + 1}`)
                                  setCustomQuestions(newQs)
                                }} className="text-xs text-blue-600 font-semibold hover:underline">
                                  + Add Option
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Labels Builder for Linear Scale */}
                          {cq.type === 'rating' && (
                            <div className="space-y-2 pl-2 pt-1 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-bold text-xs w-4 text-center">1</span>
                                <Input 
                                  value={cq.options?.[0] || ''}
                                  onChange={(e) => {
                                    const newQs = [...customQuestions]
                                    if (!newQs[index].options) newQs[index].options = ['', '']
                                    newQs[index].options[0] = e.target.value
                                    setCustomQuestions(newQs)
                                  }}
                                  placeholder="Low Label (e.g. Poor)"
                                  className="h-8 border-0 border-b border-gray-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#35408e] flex-1 shadow-none text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-bold text-xs w-4 text-center">5</span>
                                <Input 
                                  value={cq.options?.[1] || ''}
                                  onChange={(e) => {
                                    const newQs = [...customQuestions]
                                    if (!newQs[index].options) newQs[index].options = ['', '']
                                    newQs[index].options[1] = e.target.value
                                    setCustomQuestions(newQs)
                                  }}
                                  placeholder="High Label (e.g. Excellent)"
                                  className="h-8 border-0 border-b border-gray-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#35408e] flex-1 shadow-none text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Bottom Add Question Button */}
                      <button 
                        type="button" 
                        onClick={() => {
                          setCustomQuestions([...customQuestions, { id: crypto.randomUUID(), question: '', type: 'text_short' }])
                        }}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-200 hover:border-[#35408e]/40 hover:bg-blue-50/50 bg-white text-[#35408e] font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Question ({customQuestions.length + 1})
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 space-y-2">
                      <p className="text-xs text-gray-400">No custom questions added yet. The standard rating & comments form will be used.</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCustomQuestions([{ id: crypto.randomUUID(), question: '', type: 'text_short' }])}
                        className="text-xs font-semibold rounded-xl"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add First Question
                      </Button>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/80 sticky bottom-0 z-10 pb-safe">
                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isPending || isUploading} className="rounded-xl font-semibold text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || isUploading} className="bg-[#35408e] hover:bg-[#28316d] text-white rounded-xl font-bold px-6 sm:px-8 text-xs sm:text-sm shadow-md active:scale-95 transition-all">
                  {isUploading ? 'Uploading Images...' : isPending ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent className="bg-white rounded-2xl p-6 border-0 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-gray-900">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium">
              This action cannot be undone. This will permanently delete the event and all associated attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-full font-bold border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-md">
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
