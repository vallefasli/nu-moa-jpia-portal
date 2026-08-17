'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RejectedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-red-500">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Application Rejected</CardTitle>
          <CardDescription className="text-base">
            Your account request has been declined.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center">
          <p className="mb-6 text-justify px-4 w-full">
            Unfortunately, your application to join the portal was not approved. If you believe this was a mistake, please contact an administrator.
          </p>
          <Button onClick={() => router.push('/')} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg rounded-xl transition-all active:scale-[0.98]">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
