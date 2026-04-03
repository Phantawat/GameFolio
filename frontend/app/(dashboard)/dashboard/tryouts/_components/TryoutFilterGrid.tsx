'use client'

import { useState, useMemo } from 'react'
import { Search, Gamepad2, Users, MapPin, Clock, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplyButton } from './ApplyButton'
import { cn } from '@/lib/utils'

export type TryoutItem = {
  id: string
  title: string
  requirements: string | null
  created_at: string
  org: { name: string; logo_url: string | null; region: string | null } | null
  game: { name: string } | null
  role: { role_name: string } | null
  alreadyApplied: boolean
}

interface TryoutFilterGridProps {
  tryouts: TryoutItem[]
  allGames: string[]
  allRoles: string[]
}

export function TryoutFilterGrid({ tryouts, allGames, allRoles }: TryoutFilterGridProps) {
  const [search, setSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return tryouts.filter((t) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.org?.name ?? '').toLowerCase().includes(q) ||
        (t.requirements ?? '').toLowerCase().includes(q)
      const matchesGame = !selectedGame || t.game?.name === selectedGame
      const matchesRole = !selectedRole || t.role?.role_name === selectedRole
      return matchesSearch && matchesGame && matchesRole
    })
  }, [tryouts, search, selectedGame, selectedRole])

  const hasFilters = search || selectedGame || selectedRole

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search by title, org, or requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Game filter pills */}
          {allGames.map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(selectedGame === game ? null : game)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                selectedGame === game
                  ? 'bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              )}
            >
              <Gamepad2 className="w-3 h-3 inline mr-1" />
              {game}
            </button>
          ))}

          {/* Role filter pills */}
          {allRoles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                selectedRole === role
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              )}
            >
              <Users className="w-3 h-3 inline mr-1" />
              {role}
            </button>
          ))}

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setSelectedGame(null); setSelectedRole(null) }}
              className="text-zinc-500 hover:text-white text-xs h-7"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-zinc-500 text-xs">
        Showing {filtered.length} of {tryouts.length} tryout{tryouts.length !== 1 ? 's' : ''}
      </p>

      {/* Tryout Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Gamepad2 className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300">No Matching Tryouts</h2>
          <p className="text-zinc-500 mt-2 text-sm max-w-sm">
            {hasFilters
              ? 'Try adjusting your filters to find more results.'
              : 'Check back soon — organizations will be posting tryouts here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((tryout) => (
            <div
              key={tryout.id}
              className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group flex flex-col"
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#FF5C00] to-orange-400" />
              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Org Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-black text-zinc-400 shrink-0 overflow-hidden">
                    {tryout.org?.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tryout.org.logo_url} alt={tryout.org.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(tryout.org?.name ?? 'O').charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate leading-tight">{tryout.org?.name ?? 'Unknown Org'}</p>
                    {tryout.org?.region && (
                      <div className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{tryout.org.region}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-white font-bold text-base leading-tight group-hover:text-[#FF5C00] transition-colors line-clamp-2">
                  {tryout.title}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {tryout.game && (
                    <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 text-xs gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {tryout.game.name}
                    </Badge>
                  )}
                  {tryout.role && (
                    <Badge className="bg-[#FF5C00]/10 text-[#FF5C00] border-[#FF5C00]/20 text-xs gap-1">
                      <Users className="w-3 h-3" />
                      {tryout.role.role_name}
                    </Badge>
                  )}
                </div>

                {tryout.requirements && (
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 flex-1">
                    {tryout.requirements}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1 text-zinc-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(tryout.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="w-32">
                    <ApplyButton tryoutId={tryout.id} alreadyApplied={tryout.alreadyApplied} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
