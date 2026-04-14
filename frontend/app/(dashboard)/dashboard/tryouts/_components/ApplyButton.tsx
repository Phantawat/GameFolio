'use client'

import { useActionState, useEffect, useState } from 'react'
import { applyToTryout } from '../actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

interface ApplyButtonProps {
  tryoutId: string
  alreadyApplied: boolean
}

export function ApplyButton({ tryoutId, alreadyApplied }: ApplyButtonProps) {
  const [state, action, isPending] = useActionState(applyToTryout, null)
  const [open, setOpen] = useState(false)
  const hasApplied = alreadyApplied || Boolean(state?.success)
  const isDialogOpen = open && !hasApplied

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) {
      toast.success(state.success)
    }
  }, [state])

  if (hasApplied) {
    return (
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          disabled
          className="w-full bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
        >
          Applied
        </Button>
      </div>
    )
  }

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DialogRoot open={isDialogOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="w-full bg-[#FF5C00] hover:bg-orange-600 text-white font-bold transition-colors"
          >
            Apply Now
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#140C0B] border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Apply to Tryout</DialogTitle>
          </DialogHeader>
          <form action={action} className="space-y-4">
            <input type="hidden" name="tryout_id" value={tryoutId} />
            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-zinc-400">
                Message (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                placeholder="Tell the team why you're a great fit..."
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 text-sm focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1 border-zinc-800 text-zinc-400 hover:text-white">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-[#FF5C00] hover:bg-orange-600 text-white font-bold"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>
    </div>
  )
}
