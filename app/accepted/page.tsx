'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AcceptedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-green-500">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Application Approved!</CardTitle>
          <CardDescription className="text-base">
            Your account is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center">
          <p className="mb-6 text-justify px-4 w-full">
            Welcome to the NU MOA JPIA Portal. You can now access all member features.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl transition-all active:scale-[0.98]">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
