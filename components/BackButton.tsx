'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      window.close()
      // Fallback in case window.close() fails
      setTimeout(() => {
        router.push('/')
      }, 100)
    }
  }

  return (
    <button 
      onClick={handleBack}
      className="inline-flex items-center text-sm font-medium text-[#35408e] hover:underline mb-6"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  )
}
