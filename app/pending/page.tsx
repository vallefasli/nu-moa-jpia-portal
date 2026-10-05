import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'
import { LogoutDialog } from '@/components/LogoutDialog'
import { PendingPoller } from './PendingPoller'
import { getAuthenticatedUser, getCurrentUserProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingVerificationPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/')

  const profile = await getCurrentUserProfile(user.id)
  if (profile?.role === 'member' && !profile?.student_no) redirect('/complete-profile')
  if (profile?.account_status === 'active') redirect('/dashboard')
  if (profile?.account_status === 'rejected') redirect('/rejected')

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#004d2b] via-[#006B3C] to-[#00854a] p-4 overflow-hidden">
      <PendingPoller />
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.04] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/[0.04] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD54F]/30 to-transparent" />

      <Card className="w-full max-w-md border-0 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFD54F] via-amber-300 to-[#FFD54F]" />
        <CardHeader className="text-center space-y-4 pt-8 pb-4">
          <div className="mx-auto bg-amber-50 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg ring-4 ring-amber-100">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-black text-[#006B3C]">Account Under Review</CardTitle>
          <CardDescription className="text-sm font-semibold text-gray-500">
            What happens next?
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center px-8 pb-8">
          <div className="w-full space-y-3 mb-6 text-left">
            <div className="flex items-start gap-3 bg-amber-50/60 border border-amber-100 rounded-xl p-3">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</div>
              <p className="text-sm text-gray-600"><strong className="text-gray-800">Officer Approval:</strong> Your email is verified, but an administrator must review your student details before you can access the dashboard.</p>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</div>
              <p className="text-sm text-gray-500">You will be able to sign in normally once your account is activated by an officer.</p>
            </div>
          </div>
          <LogoutDialog>
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 rounded-2xl py-5 font-bold">
              Sign Out
            </Button>
          </LogoutDialog>
        </CardContent>
      </Card>

      <p className="mt-6 text-white/40 text-xs font-medium">This page refreshes automatically when approved</p>
    </div>
  )
}
