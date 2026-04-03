'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function RecruiterError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-zinc-200 mb-2">Something went wrong</h2>
      <p className="text-zinc-500 text-sm max-w-md mb-6">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={reset} className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold">
        Try Again
      </Button>
    </div>
  )
}
