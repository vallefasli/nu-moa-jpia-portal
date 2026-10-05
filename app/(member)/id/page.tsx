import { getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import DigitalIdCard from './DigitalIdCard'

export default async function DigitalIdPage() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  // Fetch profile
  const profile = await getCurrentUserProfile(user.id)
  if (!profile) return null

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="w-full max-w-sm mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100dvh-11.5rem)] md:min-h-[calc(100vh-6rem)] relative -mb-24 md:mb-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#006B3C]/5 to-transparent -z-10 pointer-events-none" />
      
      <div className="text-center mb-2 sm:mb-2.5 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-tight">My Digital ID</h1>
        <p className="text-gray-500 text-[11px] sm:text-xs">Present this QR code at events to log attendance.</p>
      </div>

      <DigitalIdCard profile={profile} initials={initials} />
    </div>
  )
}
