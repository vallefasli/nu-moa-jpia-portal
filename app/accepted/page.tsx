import { getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AcceptedPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role === 'member' && !profile?.student_no) redirect('/complete-profile')
  if (profile?.account_status === 'pending') redirect('/pending')
  if (profile?.account_status === 'rejected') redirect('/rejected')

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#004d2b] via-[#006B3C] to-[#00854a]">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.04] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/[0.04] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD54F]/30 to-transparent" />

      <Card className="w-full max-w-md border-0 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden">
        {/* Gold top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-[#FFD54F]" />
        <CardHeader className="text-center space-y-4 pt-8 pb-4">
          <div className="mx-auto bg-[#006B3C] p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg shadow-[#006B3C]/30 ring-4 ring-[#006B3C]/10">
            <CheckCircle2 className="w-10 h-10 text-[#FFD54F]" />
          </div>
          <CardTitle className="text-2xl font-black text-gray-900">Application Approved!</CardTitle>
          <CardDescription className="text-sm font-semibold text-[#006B3C]">
            Your account is now active ✓
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center px-8 pb-8">
          <p className="mb-6 text-sm text-gray-500 leading-relaxed text-center">
            Welcome to the <strong className="text-[#006B3C]">NU MOA JPIA Portal</strong>. You can now access all member features including events, your digital ID, and certificates.
          </p>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-[#006B3C] hover:bg-[#004d2b] text-white py-6 text-base font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#006B3C]/20 gap-2">
              Go to Dashboard →
            </Button>
          </Link>
        </CardContent>
      </Card>

      <p className="mt-6 text-white/40 text-xs font-medium">NU MOA JPIA Membership Portal</p>
    </div>
  )
}
