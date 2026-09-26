'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RejectedPage() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.02] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/[0.02] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      <Card className="w-full max-w-md border-0 shadow-2xl shadow-black/40 rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400" />
        <CardHeader className="text-center space-y-4 pt-8 pb-4">
          <div className="mx-auto bg-red-50 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg ring-4 ring-red-100">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-black text-gray-900">Application Rejected</CardTitle>
          <CardDescription className="text-sm font-semibold text-red-500">
            Your account request has been declined.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center px-8 pb-8">
          <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              Unfortunately, your application to join the portal was not approved. If you believe this was a mistake, please <strong className="text-gray-800">contact an administrator</strong>.
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-base font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg">
            Return to Home
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-white/20 text-xs font-medium">NU MOA JPIA Membership Portal</p>
    </div>
  )
}
