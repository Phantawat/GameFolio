'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { createTryout, updateTryout } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ChevronDown, Info, Shield, FileText, Send, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Game = { id: string; name: string }
type GameRole = { id: string; game_id: string; role_name: string }
type Roster = { id: string; name: string }

const REGIONS = ['NA', 'EUW', 'EUNE', 'KR', 'BR', 'LAN', 'LAS', 'OCE', 'SEA']

interface Props {
  orgId: string
  games: Game[]
  gameRoles: GameRole[]
  rosters: Roster[]
  preSelectedRosterId?: string
  mode?: 'create' | 'edit' | 'view'
  initialTryout?: {
    id: string
    gameId: string
    roleNeededId: string | null
    rosterId: string | null
    title: string
    isActive: boolean
    minRankRequirement: string
    selectedRegions: string[]
    apiVerify: boolean
    description: string
  }
}

export default function NewTryoutForm({
  orgId,
  games,
  gameRoles,
  rosters,
  preSelectedRosterId,
  mode = 'create',
  initialTryout,
}: Props) {
  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'

  const actionToUse = isEditMode ? updateTryout : createTryout
  const [state, formAction, isPending] = useActionState(actionToUse, null)

  const [selectedGame, setSelectedGame] = useState(initialTryout?.gameId ?? '')
  const [selectedRole, setSelectedRole] = useState(initialTryout?.roleNeededId ?? '')
  const [selectedRoster, setSelectedRoster] = useState(initialTryout?.rosterId ?? preSelectedRosterId ?? '')
  const [title, setTitle] = useState(initialTryout?.title ?? '')
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    initialTryout?.selectedRegions?.length ? initialTryout.selectedRegions : ['NA']
  )
  const [minRankRequirement, setMinRankRequirement] = useState(initialTryout?.minRankRequirement ?? '')
  const [apiVerify, setApiVerify] = useState(initialTryout?.apiVerify ?? false)
  const [description, setDescription] = useState(initialTryout?.description ?? '')

  const filteredRoles = gameRoles.filter((r) => r.game_id === selectedGame)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  function toggleRegion(region: string) {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {isEditMode && initialTryout && <input type="hidden" name="tryout_id" value={initialTryout.id} />}
      <input type="hidden" name="organization_id" value={orgId} />
      {/* Requirements stay concise; job description is persisted separately. */}
      <input
        type="hidden"
        name="requirements"
        value={[
          minRankRequirement.trim() ? `Minimum Rank: ${minRankRequirement.trim()}` : '',
          selectedRegions.length > 0 ? `Regions: ${selectedRegions.join(', ')}` : '',
          apiVerify ? `API Verify: Required` : '',
        ]
          .filter(Boolean)
          .join('\n')}
      />
      <input type="hidden" name="job_description" value={description} />

      {/* ── Core Details ── */}
      <section className="bg-[#140C0B] border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Core Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Game */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wide">Game</Label>
            <div className="relative">
              <select
                name="game_id"
                required
                value={selectedGame}
                onChange={(e) => {
                  setSelectedGame(e.target.value)
                  setSelectedRole('')
                }}
                disabled={isViewMode}
                className="w-full bg-[#0F0A09] border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 cursor-pointer"
              >
                <option value="" disabled>
                  Select Game
                </option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Main Role */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wide">Main Role</Label>
            <div className="relative">
              <select
                name="role_needed_id"
                disabled={!selectedGame || isViewMode}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[#0F0A09] border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Select Role</option>
                {filteredRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Target Roster */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 text-xs uppercase tracking-wide">
            Target Roster{' '}
            <span className="text-zinc-600 normal-case">(Optional)</span>
          </Label>
          <div className="relative">
            <select
              name="roster_id"
              value={selectedRoster}
              onChange={(e) => setSelectedRoster(e.target.value)}
              disabled={isViewMode}
              className="w-full bg-[#0F0A09] border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 cursor-pointer"
            >
              <option value="">e.g. Academy Team A, Main VCT Squad</option>
              {rosters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Tryout Title */}
        <div className="space-y-1.5">
          <Label htmlFor="tryout-title" className="text-zinc-400 text-xs uppercase tracking-wide">Tryout Title</Label>
          <Input
            id="tryout-title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isViewMode}
            placeholder="e.g. Need IGL for VCT Qualifier"
            className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/40"
          />
        </div>
      </section>

      {/* ── Requirements ── */}
      <section className="bg-[#140C0B] border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Requirements
          </h2>
        </div>

        {/* Min Rank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="min-rank-requirement" className="text-zinc-400 text-xs uppercase tracking-wide">
              Minimum Rank Requirement
            </Label>
            <Input
              id="min-rank-requirement"
              name="min_rank_display"
              value={minRankRequirement}
              onChange={(e) => setMinRankRequirement(e.target.value)}
              disabled={isViewMode}
              placeholder="e.g. Radiant, Challenger, Global Elite"
              className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/40"
            />
          </div>

          {/* Region(s) */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wide">
              Region(s)
            </Label>
            <div className="flex flex-wrap gap-2 min-h-[42px] bg-[#0F0A09] border border-zinc-700 rounded-lg px-3 py-2 items-center">
              {selectedRegions.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 bg-[#FF5C00]/20 border border-[#FF5C00]/40 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => toggleRegion(r)}
                    disabled={isViewMode}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {/* Add region dropdown */}
              {selectedRegions.length < REGIONS.length && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) toggleRegion(e.target.value)
                    e.target.value = ''
                  }}
                  disabled={isViewMode}
                  className="bg-transparent text-zinc-500 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="">+ Add</option>
                  {REGIONS.filter((r) => !selectedRegions.includes(r)).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* API Verify Toggle */}
        <div className="flex items-center gap-3 bg-[#0F0A09] border border-zinc-700 rounded-lg px-4 py-3">
          <button
            type="button"
            role="switch"
            aria-checked={apiVerify}
            onClick={() => setApiVerify(!apiVerify)}
            disabled={isViewMode}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40',
              apiVerify ? 'bg-[#FF5C00]' : 'bg-zinc-700'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                apiVerify ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </button>
          <span className="text-sm text-zinc-300 font-medium">Verify via API Required?</span>
          <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black flex items-center justify-center">
            ?
          </span>
        </div>
      </section>

      {/* ── Role Description ── */}
      <section className="bg-[#140C0B] border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Role Description &amp; Expectations
            </h2>
          </div>
          {/* Formatting toolbar (decorative) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 text-xs font-black"
            >
              B
            </button>
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 text-xs italic"
            >
              I
            </button>
            <button
              type="button"
              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ≡
            </button>
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isViewMode}
          placeholder="Describe the daily schedule, specific agent pool requirements, and what you expect from the candidate..."
          rows={5}
          className="w-full bg-[#0F0A09] border border-zinc-700 text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
        />

        <p className="text-right text-xs text-zinc-600 italic">
          Minimum 100 characters recommended.
        </p>
      </section>

      {/* ── Submit Buttons ── */}
      {isViewMode ? (
        <div className="flex items-center justify-end gap-3 pt-2">
          {initialTryout && (
            <Link
              href={`/org/tryouts/new?edit=${initialTryout.id}`}
              className="inline-flex h-10 items-center rounded-md bg-[#FF5C00] px-4 text-sm font-bold text-white hover:bg-orange-600"
            >
              Edit Tryout
            </Link>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            name="is_active"
            value="false"
            disabled={isPending}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Save Changes' : 'Save Draft'}
          </Button>
          <Button
            type="submit"
            name="is_active"
            value="true"
            disabled={isPending}
            className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isEditMode ? 'Update & Publish' : 'Publish Tryout'}
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
