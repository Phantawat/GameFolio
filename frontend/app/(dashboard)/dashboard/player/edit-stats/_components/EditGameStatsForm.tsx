'use client'

import { useActionState, useState, useEffect } from 'react'
import { upsertGameStats } from '../../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ChevronDown, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface GameRole {
  id: string
  role_name: string
}

interface Game {
  id: string
  name: string
  game_roles: GameRole[]
}

interface ExistingStat {
  game_id: string
  main_role_id: string | null
  rank: string | null
  mmr: number | null
  win_rate: number | null
  hours_played: number | null
}

interface EditGameStatsFormProps {
  games: Game[]
  existingStats: ExistingStat[]
}

export function EditGameStatsForm({ games, existingStats }: EditGameStatsFormProps) {
  const [state, action, isPending] = useActionState(upsertGameStats, null)
  const [selectedGameId, setSelectedGameId] = useState<string>('')

  // When a game is selected, prefill with existing stats if they exist
  const selectedGame = games.find(g => g.id === selectedGameId)
  const existingStat = existingStats.find(s => s.game_id === selectedGameId)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <Card className="bg-[#140C0B] border-zinc-800 shadow-sm">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="text-white font-bold text-lg">Game Statistics Form</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {games.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
            <p className="text-zinc-300 font-semibold">No games found in the database</p>
            <p className="text-zinc-500 text-sm max-w-sm">
              The game catalog hasn&apos;t been seeded yet. Run the <code className="text-orange-400 bg-zinc-900 px-1.5 py-0.5 rounded text-xs">supabase/seed.sql</code> script in your Supabase SQL Editor to add games.
            </p>
          </div>
        ) : (
        <form action={action} className="space-y-6">
          {/* Game Selector */}
          <div className="space-y-2">
            <Label htmlFor="game-select" className="text-zinc-300 font-semibold uppercase text-xs tracking-wider">Game *</Label>
            <div className="relative">
              <select
                id="game-select"
                name="game_id"
                required
                value={selectedGameId}
                onChange={e => setSelectedGameId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              >
                <option value="">Select a game...</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Role Selector - only shown with a game selected */}
          {selectedGame && (
            <div className="space-y-2">
              <Label htmlFor="main-role-select" className="text-zinc-300 font-semibold uppercase text-xs tracking-wider">Main Role</Label>
              <div className="relative">
                <select
                  id="main-role-select"
                  name="main_role_id"
                  defaultValue={existingStat?.main_role_id || ''}
                  className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                >
                  <option value="">Select a role...</option>
                  {selectedGame.game_roles.map(role => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>
          )}

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="current-rank" className="text-zinc-300 font-semibold uppercase text-xs tracking-wider">Current Rank *</Label>
            <Input
              id="current-rank"
              name="rank"
              placeholder="e.g. Radiant #124, Diamond 1, Global Elite"
              required
              defaultValue={existingStat?.rank || ''}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-orange-500/30 focus:border-orange-500/50"
            />
          </div>

          {/* Grid: MMR, Win Rate, Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mmr" className="text-zinc-300 font-semibold uppercase text-xs tracking-wider">MMR</Label>
              <Input
                id="mmr"
                name="mmr"
                type="number"
                min={0}
                placeholder="e.g. 2450"
                defaultValue={existingStat?.mmr ?? ''}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-orange-500/30 focus:border-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="win-rate" className="text-zinc-300 font-semibold uppercase text-xs tracking-wider">Win Rate %</Label>
              <Input
                id="win-rate"
                name="win_rate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="e.g. 62"
                defaultValue={existingStat?.win_rate ?? ''}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-orange-500/30 focus:border-orange-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-played" className="text-zinc-300 font-semibold uppercase text-xs tracking-wider">Hours Played</Label>
              <Input
                id="hours-played"
                name="hours_played"
                type="number"
                min={0}
                placeholder="e.g. 1200"
                defaultValue={existingStat?.hours_played ?? ''}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-orange-500/30 focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#FF5C00] hover:bg-[#E65200] text-white font-bold px-8 shadow-lg shadow-orange-900/20 transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                'Save Stats'
              )}
            </Button>
            <Button asChild variant="ghost" className="text-zinc-400 hover:text-white">
              <Link href="/dashboard/player">Cancel</Link>
            </Button>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  )
}
