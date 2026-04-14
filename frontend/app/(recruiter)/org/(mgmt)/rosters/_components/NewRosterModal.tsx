'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Plus, ChevronDown, Loader2 } from 'lucide-react'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRoster } from '../actions'
import { toast } from 'sonner'

type Game = { id: string; name: string }

interface NewRosterModalProps {
  orgId: string
  games: Game[]
  variant?: 'new-roster' | 'create-now'
}

export default function NewRosterModal({
  orgId,
  games,
  variant = 'new-roster',
}: NewRosterModalProps) {
  const [state, formAction, isPending] = useActionState(createRoster, null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const dialogId = `roster-dialog-${orgId}-${variant}`
  const dialogTitleId = `${dialogId}-title`
  const dialogDescriptionId = `${dialogId}-description`

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success)
      closeButtonRef.current?.click()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        {variant === 'create-now' ? (
          <Button className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold">
            Create Now
          </Button>
        ) : (
          <Button className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold gap-2">
            <Plus className="w-4 h-4" />
            New Roster
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        id={dialogId}
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="max-w-md"
      >
        <DialogTitle className="sr-only">Add New Team Roster</DialogTitle>
        <DialogHeader>
          <DialogTitle id={dialogTitleId}>Add New Team Roster</DialogTitle>
          <DialogDescription id={dialogDescriptionId}>
            Create a new organizational unit for your players.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-2">
          <input type="hidden" name="organization_id" value={orgId} />

          {/* Game Select */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-xs uppercase tracking-wider font-bold">
              Select Game
            </Label>
            <div className="relative">
              <select
                name="game_id"
                required
                defaultValue=""
                className="w-full bg-[#0F0A09] border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 cursor-pointer"
              >
                <option value="" disabled>
                  Select a game
                </option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Roster Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="roster-name"
              className="text-zinc-300 text-xs uppercase tracking-wider font-bold"
            >
              Roster Name
            </Label>
            <Input
              id="roster-name"
              name="name"
              required
              placeholder="e.g. Academy"
              className="bg-[#0F0A09] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-orange-500/40 focus-visible:border-orange-500/50"
            />
          </div>

          {/* Region (UI only — no DB column) */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-xs uppercase tracking-wider font-bold">
              Region
            </Label>
            <Input
              name="region_display"
              placeholder="North America"
              className="bg-[#0F0A09] border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-orange-500/40 focus-visible:border-orange-500/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-[#FF5C00] hover:bg-orange-600 text-white font-bold"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Roster'}
            </Button>
          </div>
        </form>

        <DialogClose asChild>
          <button ref={closeButtonRef} type="button" className="hidden" aria-hidden tabIndex={-1}>
            Close
          </button>
        </DialogClose>
      </DialogContent>
    </DialogRoot>
  )
}
