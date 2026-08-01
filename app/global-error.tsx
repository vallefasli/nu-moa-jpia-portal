'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Something went wrong!</h2>
            <p className="text-sm text-gray-500">
              We encountered an unexpected error. This has been logged and our team will look into it.
            </p>
            <div className="pt-4">
              <Button 
                onClick={() => reset()}
                className="w-full bg-[#35408e] hover:bg-[#2a3370]"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
