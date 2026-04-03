'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0F0A09] flex flex-col items-center justify-center text-center px-6">
      <AlertTriangle className="w-16 h-16 text-red-400 mb-6" />
      <h1 className="text-2xl font-bold text-zinc-200 mb-2">Something went wrong</h1>
      <p className="text-zinc-500 text-sm max-w-md mb-8">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={reset} className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold">
        Try Again
      </Button>
    </div>
  )
}
