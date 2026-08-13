'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, Calendar, MapPin, Users, Award, MoreVertical, X, Trash } from 'lucide-react'
import { createEvent, updateEvent, deleteEvent, clearAllEvents } from './actions'
import { getEventStatus } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function EventManagementClient({ events, isAdmin }: { events: any[], isAdmin: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [customQuestions, setCustomQuestions] = useState<any[]>([])

  const handleOpenModal = (event: any = null) => {
    setEditingEvent(event)
    setCustomQuestions(event?.custom_feedback_questions || [])
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingEvent(null)
    setCustomQuestions([])
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('custom_feedback_questions', JSON.stringify(customQuestions))
    
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
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="bg-[#fbb03b] hover:bg-[#e09e35] text-black font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map(ev => {
          const effectiveStatus = getEventStatus(ev)
          return (
            <Card key={ev.id} className="overflow-hidden border-gray-200 shadow-sm flex flex-col">
              <div className={`h-2 w-full ${effectiveStatus === 'ongoing' ? 'bg-emerald-500' : effectiveStatus === 'completed' ? 'bg-gray-300' : 'bg-blue-500'}`} />
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{ev.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                        {ev.event_type || 'General'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                        effectiveStatus === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : 
                        effectiveStatus === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {effectiveStatus}
                      </span>
                    </div>
                  </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(ev)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(ev.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mt-auto text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(ev.date).toLocaleDateString()} &middot; {ev.time_start.slice(0,5)} - {ev.time_end.slice(0,5)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{ev.location || 'TBA'}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{ev.capacity ? `${ev.capacity} slots` : 'Unlimited'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#35408e] font-semibold text-sm bg-[#35408e]/10 px-2 py-1 rounded-md">
                    People going: {ev.event_rsvps?.[0]?.count || 0}
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Award className="w-4 h-4 text-[#fbb03b]" />
                    <span>{ev.points_awarded || 0} pts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No events found. Create one to get started!
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                  <Input name="title" defaultValue={editingEvent?.title} required placeholder="e.g. Annual General Assembly" className="bg-gray-50" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingEvent?.description} 
                    rows={3}
                    className="w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                    placeholder="Provide details about the event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                    <Input name="location" defaultValue={editingEvent?.location} required placeholder="e.g. Main Auditorium" className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Event Type</label>
                    <select name="event_type" defaultValue={editingEvent?.event_type || 'General'} className="w-full h-10 rounded-md border border-input bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="General">General Assembly</option>
                      <option value="Academic">Academic</option>
                      <option value="Social">Social</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                    <Input type="date" name="date" defaultValue={editingEvent?.date} required className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                    <Input type="time" name="time_start" defaultValue={editingEvent?.time_start} required className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                    <Input type="time" name="time_end" defaultValue={editingEvent?.time_end} required className="bg-gray-50" />
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${editingEvent ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 border-t border-gray-100 pt-4`}>
                  {editingEvent && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Status Override</label>
                      <select name="status" defaultValue={editingEvent?.status || 'upcoming'} className="w-full h-10 rounded-md border border-input bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Capacity</label>
                    <Input type="number" name="capacity" defaultValue={editingEvent?.capacity} placeholder="Leave blank for unlimited" className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Points Awarded</label>
                    <Input type="number" name="points_awarded" defaultValue={editingEvent?.points_awarded || 0} required min="0" className="bg-gray-50" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-700">Custom Feedback Questions (Optional)</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCustomQuestions([...customQuestions, { id: crypto.randomUUID(), question: '', type: 'text' }])}
                      className="text-xs h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Question
                    </Button>
                  </div>
                  {customQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {customQuestions.map((cq, index) => (
                        <div key={cq.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex-1 space-y-2">
                            <Input 
                              value={cq.question}
                              onChange={(e) => {
                                const newQs = [...customQuestions]
                                newQs[index].question = e.target.value
                                setCustomQuestions(newQs)
                              }}
                              placeholder="e.g. How was the guest speaker?"
                              className="bg-white h-8 text-sm"
                              required
                            />
                            <select 
                              value={cq.type}
                              onChange={(e) => {
                                const newQs = [...customQuestions]
                                newQs[index].type = e.target.value
                                setCustomQuestions(newQs)
                              }}
                              className="w-full h-8 rounded-md border border-input bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="text">Text Response</option>
                              <option value="rating">1-5 Star Rating</option>
                            </select>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setCustomQuestions(customQuestions.filter(q => q.id !== cq.id))}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No custom questions added. The standard rating & comments form will be used.</p>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-gray-900 hover:bg-gray-800 text-white min-w-[120px]">
                  {isPending ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
