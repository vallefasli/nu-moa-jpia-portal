import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEventStatus(event: { date: string; time_start?: string; time_end?: string; status?: string }) {
  if (event.status === 'completed' || event.status === 'cancelled') {
    return event.status
  }
  
  const now = new Date()
  const startTimeStr = event.time_start ? event.time_start.slice(0, 8) : '00:00:00'
  const endTimeStr = event.time_end ? event.time_end.slice(0, 8) : '23:59:59'

  const start = new Date(`${event.date}T${startTimeStr}`)
  const end = new Date(`${event.date}T${endTimeStr}`)

  if (now > end) {
    return 'completed'
  }
  if (event.status === 'ongoing' || (now >= start && now <= end)) {
    return 'ongoing'
  }
  return 'upcoming'
}
