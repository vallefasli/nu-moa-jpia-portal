'use client'

import { useState, useTransition, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2,  Image as ImageIcon, Upload, X, MapPin, 
  Users, Trash2, Calendar, FileText, Share2, Eye, ExternalLink, RefreshCw, CheckCircle2, ChevronRight, ListChecks, ArrowLeft,
  Search, Trash, ImageIcon as BannerIcon
} from 'lucide-react'
import { createEvent, updateEvent, deleteEvent } from './actions'
import { getEventStatus } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { EventCardClient } from '../../../(member)/events/EventCardClient'

export function EventManagementClient({ events, isAdmin }: { events: any[], isAdmin: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const predefinedTypes = ['General', 'Academic', 'Social', 'Community']
  const [categorySelect, setCategorySelect] = useState('General')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [customQuestions, setCustomQuestions] = useState<any[]>([])
  
  // Custom Themes State
  const [themes, setThemes] = useState<string[]>([])
  const [themeInput, setThemeInput] = useState('')
  
  // Image Upload State
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const [isUploading, setIsUploading] = useState(false)
  
  const posterInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
  
  const supabase = createClient()

  const handleOpenModal = (event: any = null) => {
    setEditingEvent(event)
    setCustomQuestions(event?.custom_feedback_questions || [])
    setThemes(event?.themes || [])
    setThemeInput('')
    setPosterPreview(event?.poster_url || null)
    setPosterFile(null)
    setBannerPreview(event?.banner_url || null)
    setBannerFile(null)
    const initialType = event?.event_type || 'General'
    setCategorySelect(predefinedTypes.includes(initialType) ? initialType : 'Other')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingEvent(null)
    setCustomQuestions([])
    setThemes([])
    setThemeInput('')
    setPosterPreview(null)
    setPosterFile(null)
    setBannerPreview(null)
    setBannerFile(null)
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

  const handleDelete = async (id: string) => {
    if (!isAdmin) return toast.error("Only Admins can delete events")
    if (!confirm('Are you sure you want to delete this event? This will also delete all attendance records for it.')) return
    
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus-visible:ring-[#35408e] rounded-full h-10 shadow-sm"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#fbb03b] hover:bg-[#e09e35] text-black font-bold shadow-md rounded-full px-6 h-10 shrink-0">
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
              <Button onClick={() => handleOpenModal()} className="bg-[#fbb03b] hover:bg-[#e09e35] text-black font-bold rounded-full">
                Create Event
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-black text-gray-900">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button type="button" onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto space-y-8 flex-1">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images Column */}
                <div className="space-y-6 lg:col-span-1">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Circle Badge (Card Poster)</label>
                    <div 
                      onClick={() => posterInputRef.current?.click()}
                      className="aspect-square w-full max-w-[200px] mx-auto rounded-full border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-sm"
                    >
                      {posterPreview ? (
                        <>
                          <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <span className="text-[10px] text-gray-500 font-medium">Upload Badge (1:1)</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      ref={posterInputRef} 
                      onChange={(e) => handleImageChange(e, setPosterFile, setPosterPreview)}
                      className="hidden" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Wide Banner (Expanded View)</label>
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group shadow-sm"
                    >
                      {bannerPreview ? (
                        <>
                          <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <BannerIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <span className="text-[10px] text-gray-500 font-medium">Upload Banner (16:9)</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      ref={bannerInputRef} 
                      onChange={(e) => handleImageChange(e, setBannerFile, setBannerPreview)}
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Details Column */}
                <div className="space-y-6 lg:col-span-2">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Event Title</label>
                      <Input name="title" defaultValue={editingEvent?.title} required placeholder="e.g. Google I/O Manila 2026" className="bg-gray-50 border-gray-200 h-11 rounded-xl" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Description</label>
                      <textarea 
                        name="description" 
                        defaultValue={editingEvent?.description} 
                        rows={4}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all resize-none" 
                        placeholder="Provide details about the event..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Location</label>
                      <Input name="location" defaultValue={editingEvent?.location} required placeholder="e.g. One Ayala, Makati" className="bg-gray-50 border-gray-200 h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Base Category</label>
                      <select 
                        name={categorySelect === 'Other' ? "dummy_event_type" : "event_type"} 
                        value={categorySelect}
                        onChange={(e) => setCategorySelect(e.target.value)}
                        className={`w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${categorySelect === 'Other' ? 'mb-2' : ''}`}
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
                          className="bg-white border-gray-200 h-11 rounded-xl w-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Custom Themes */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">Custom Themes / Tags</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <div className="flex flex-wrap gap-2 mb-2 px-1">
                        {themes.map(t => (
                          <span key={t} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
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
                        placeholder="Type a tag (e.g., AI, Cloud) and press Enter..." 
                        className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-8 px-2" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Date</label>
                      <Input type="date" name="date" defaultValue={editingEvent?.date} required className="bg-gray-50 border-gray-200 h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Start Time</label>
                      <Input type="time" name="time_start" defaultValue={editingEvent?.time_start} required className="bg-gray-50 border-gray-200 h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">End Time</label>
                      <Input type="time" name="time_end" defaultValue={editingEvent?.time_end} required className="bg-gray-50 border-gray-200 h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 ${editingEvent ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100`}>
                    {editingEvent && (
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Status Override</label>
                        <select name="status" defaultValue={editingEvent?.status || 'upcoming'} className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Capacity</label>
                      <Input type="number" name="capacity" defaultValue={editingEvent?.capacity} placeholder="Leave blank for unlimited" className="bg-white border-gray-200 h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Points Awarded</label>
                      <Input type="number" name="points_awarded" defaultValue={editingEvent?.points_awarded || 0} required min="0" className="bg-white border-gray-200 h-11 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <label className="block text-sm font-bold text-gray-900">Custom Feedback Questions (Optional)</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCustomQuestions([...customQuestions, { id: crypto.randomUUID(), question: '', type: 'text_short' }])}
                    className="text-xs h-8 rounded-full font-semibold border-gray-200"
                  >
                    <Plus className="w-3 h-3 mr-1.5" /> Add Question
                  </Button>
                </div>
                {customQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {customQuestions.map((cq, index) => (
                      <div key={cq.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-all hover:border-gray-300">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <Input 
                            value={cq.question}
                            onChange={(e) => {
                              const newQs = [...customQuestions]
                              newQs[index].question = e.target.value
                              setCustomQuestions(newQs)
                            }}
                            placeholder="Question Title"
                            className="bg-gray-50 h-12 flex-1 rounded-xl text-lg font-semibold"
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
                            className="h-12 w-full md:w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <option value="text_short">Short Answer</option>
                            <option value="text_long">Paragraph</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="checkboxes">Checkboxes</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="rating">Linear Scale (1-5)</option>
                            {/* Fallbacks for existing data */}
                            <option value="text" className="hidden">Short Answer</option>
                          </select>
                        </div>

                        {/* Options Builder for Multiple Choice / Checkboxes / Dropdown */}
                        {['multiple_choice', 'checkboxes', 'dropdown'].includes(cq.type) && (
                          <div className="space-y-2 pl-2 mb-4">
                            {cq.options?.map((opt: string, optIndex: number) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                {cq.type === 'multiple_choice' ? <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" /> :
                                 cq.type === 'checkboxes' ? <div className="w-4 h-4 rounded-[4px] border-2 border-gray-300 flex-shrink-0" /> :
                                 <span className="text-gray-400 font-bold text-sm w-4 text-center">{optIndex + 1}.</span>}
                                <Input 
                                  value={opt}
                                  onChange={(e) => {
                                    const newQs = [...customQuestions]
                                    newQs[index].options[optIndex] = e.target.value
                                    setCustomQuestions(newQs)
                                  }}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="h-10 border-0 border-b border-gray-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-500 flex-1 shadow-none"
                                />
                                {cq.options.length > 1 && (
                                  <button type="button" onClick={() => {
                                    const newQs = [...customQuestions]
                                    newQs[index].options.splice(optIndex, 1)
                                    setCustomQuestions(newQs)
                                  }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center gap-3 pt-2">
                                {cq.type === 'multiple_choice' ? <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" /> :
                                 cq.type === 'checkboxes' ? <div className="w-4 h-4 rounded-[4px] border-2 border-gray-300 flex-shrink-0" /> :
                                 <span className="text-gray-400 font-bold text-sm w-4 text-center">{cq.options?.length ? cq.options.length + 1 : 1}.</span>}
                              <button type="button" onClick={() => {
                                const newQs = [...customQuestions]
                                if (!newQs[index].options) newQs[index].options = []
                                newQs[index].options.push(`Option ${newQs[index].options.length + 1}`)
                                setCustomQuestions(newQs)
                              }} className="text-sm text-blue-600 font-medium hover:underline">
                                Add Option
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Labels Builder for Linear Scale */}
                        {cq.type === 'rating' && (
                          <div className="space-y-3 pl-2 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-bold w-4 text-center">1</span>
                              <Input 
                                value={cq.options?.[0] || ''}
                                onChange={(e) => {
                                  const newQs = [...customQuestions]
                                  if (!newQs[index].options) newQs[index].options = ['', '']
                                  newQs[index].options[0] = e.target.value
                                  setCustomQuestions(newQs)
                                }}
                                placeholder="Label (optional)"
                                className="h-10 border-0 border-b border-gray-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-500 flex-1 shadow-none max-w-xs"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-bold w-4 text-center">5</span>
                              <Input 
                                value={cq.options?.[1] || ''}
                                onChange={(e) => {
                                  const newQs = [...customQuestions]
                                  if (!newQs[index].options) newQs[index].options = ['', '']
                                  newQs[index].options[1] = e.target.value
                                  setCustomQuestions(newQs)
                                }}
                                placeholder="Label (optional)"
                                className="h-10 border-0 border-b border-gray-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-500 flex-1 shadow-none max-w-xs"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
                          <button 
                            type="button"
                            onClick={() => setCustomQuestions(customQuestions.filter(q => q.id !== cq.id))}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-semibold"
                          >
                            <Trash className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCustomQuestions([...customQuestions, { id: crypto.randomUUID(), question: '', type: 'text_short' }])}
                        className="w-full h-12 border-dashed border-2 border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 font-bold text-sm transition-all rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Another Question
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">No custom questions added. The standard rating & comments form will be used.</p>
                )}
              </div>

              </div>
              <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isPending || isUploading} className="rounded-full font-semibold">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || isUploading} className="bg-[#35408e] hover:bg-[#28316d] text-white rounded-full font-bold px-8 shadow-md">
                  {isUploading ? 'Uploading Images...' : isPending ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
