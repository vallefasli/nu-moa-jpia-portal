import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading data...</p>
    </div>
  )
}
