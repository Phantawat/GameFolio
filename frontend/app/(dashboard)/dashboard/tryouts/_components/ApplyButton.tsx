'use client'

import { useActionState, useEffect } from 'react'
import { applyToTryout } from '../actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ApplyButtonProps {
  tryoutId: string
  alreadyApplied: boolean
}

export function ApplyButton({ tryoutId, alreadyApplied }: ApplyButtonProps) {
  const [state, action, isPending] = useActionState(applyToTryout, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  if (alreadyApplied) {
    return (
      <Button
        size="sm"
        disabled
        className="w-full bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
      >
        Applied
      </Button>
    )
  }

  return (
    <form action={action}>
      <input type="hidden" name="tryout_id" value={tryoutId} />
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="w-full bg-[#FF5C00] hover:bg-orange-600 text-white font-bold transition-colors"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Now'}
      </Button>
    </form>
  )
}
