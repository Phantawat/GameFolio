'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboarding } from './actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Flame, Sparkles } from 'lucide-react'

const initialState = {
  error: '',
}

export default function OnboardingPage() {
  const [state, formAction] = useActionState(completeOnboarding, initialState)

  useEffect(() => {
    if (state?.error) {
      toast.error('Failed to create profile: ' + state.error)
    }
  }, [state])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050304] px-4 py-10">
      {/* Black-fire atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,84,20,0.22),transparent_45%),radial-gradient(circle_at_80%_25%,rgba(255,120,40,0.14),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,60,0,0.2),transparent_50%)]" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#ff5c00]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-12 h-72 w-72 rounded-full bg-[#ff7a1a]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5),rgba(5,3,4,0.9))]" />
      </div>

      <Card className="relative w-full max-w-xl border-zinc-800/80 bg-[#140C0B]/90 text-zinc-50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#FF5C00]/30 bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF8A3D]">
            <Flame className="h-3.5 w-3.5" />
            Player Onboarding
          </div>
          <CardTitle className="text-center text-3xl font-black tracking-tight text-white sm:text-4xl">
            Build Your Gamer Identity
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            One quick step to unlock your player dashboard, stats, and tryout applications.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="gamertag" className="text-zinc-300">
                Gamertag
              </Label>
              <Input
                id="gamertag"
                name="gamertag"
                placeholder="e.g. Ganzanarak"
                required
                className="h-11 border-zinc-700 bg-[#0F0A09] text-zinc-50 placeholder:text-zinc-600 focus-visible:border-[#FF5C00]/60 focus-visible:ring-[#FF5C00]/35"
              />
              <p className="text-xs text-zinc-500">Shown on your public profile and applications.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="region" className="text-zinc-300">
                  Region
                </Label>
                <Input
                  id="region"
                  name="region"
                  placeholder="NA, EU, SEA"
                  required
                  className="h-11 border-zinc-700 bg-[#0F0A09] text-zinc-50 placeholder:text-zinc-600 focus-visible:border-[#FF5C00]/60 focus-visible:ring-[#FF5C00]/35"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-zinc-300">
                  Bio
                </Label>
                <Input
                  id="bio"
                  name="bio"
                  placeholder="Your playstyle in one line"
                  className="h-11 border-zinc-700 bg-[#0F0A09] text-zinc-50 placeholder:text-zinc-600 focus-visible:border-[#FF5C00]/60 focus-visible:ring-[#FF5C00]/35"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-11 w-full bg-[#FF5C00] font-bold text-white hover:bg-orange-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
