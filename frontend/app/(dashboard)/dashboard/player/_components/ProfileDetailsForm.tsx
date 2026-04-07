'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { updatePlayerProfile } from '../actions'

type ProfileDetailsFormProps = {
  gamertag: string
  region?: string | null
  bio?: string | null
}

export function ProfileDetailsForm({ gamertag, region, bio }: ProfileDetailsFormProps) {
  const [state, formAction, isPending] = useActionState(updatePlayerProfile, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <section className="rounded-xl border border-zinc-800 bg-[#140C0B] p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Profile Details</h2>
        <p className="mt-1 text-sm text-zinc-400">Update your visible player information.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="gamertag" className="text-zinc-400 text-xs uppercase tracking-wide">
              Gamertag
            </Label>
            <Input
              id="gamertag"
              name="gamertag"
              defaultValue={gamertag}
              required
              className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="region" className="text-zinc-400 text-xs uppercase tracking-wide">
              Region
            </Label>
            <Input
              id="region"
              name="region"
              defaultValue={region ?? ''}
              placeholder="NA, EU, SEA..."
              className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/40"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-zinc-400 text-xs uppercase tracking-wide">
            About Me
          </Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={bio ?? ''}
            rows={5}
            placeholder="Tell teams about your playstyle, goals, and competitive experience."
            className="w-full rounded-md border border-zinc-700 bg-[#0F0A09] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#FF5C00] hover:bg-orange-600 text-white font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  )
}
