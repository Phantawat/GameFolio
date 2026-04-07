'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateCompetitiveExperience } from '../actions'

type ExperienceProps = {
    value?: string | null
}

type ExperienceData = {
    year: string
    role: string
    game: string
    team: string
    highlights: string
}

const emptyExperience: ExperienceData = {
    year: '',
    role: '',
    game: '',
    team: '',
    highlights: '',
}

function parseExperienceList(value?: string | null): ExperienceData[] {
    const empty: ExperienceData[] = [emptyExperience]

    if (!value) return empty

    try {
        const parsed = JSON.parse(value) as unknown

        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((entry) => {
                const item = entry as Partial<ExperienceData>
                return {
                    year: item.year ?? '',
                    role: item.role ?? '',
                    game: item.game ?? '',
                    team: item.team ?? '',
                    highlights: item.highlights ?? '',
                }
            })
        }

        if (typeof parsed === 'object' && parsed !== null) {
            const single = parsed as Partial<ExperienceData>
            return [
                {
                    year: single.year ?? '',
                    role: single.role ?? '',
                    game: single.game ?? '',
                    team: single.team ?? '',
                    highlights: single.highlights ?? '',
                },
            ]
        }
    } catch {
        // no-op; handled below
    }

    if (value.trim().length > 0) {
        return [
            {
                year: '',
                role: '',
                game: '',
                team: '',
                highlights: value,
            },
        ]
    }
    return empty
}

function isEntryMeaningful(entry: ExperienceData) {
    return Boolean(entry.year.trim() || entry.role.trim() || entry.game.trim() || entry.team.trim() || entry.highlights.trim())
}

export function Experience({ value }: ExperienceProps) {
    const [state, formAction, isPending] = useActionState(updateCompetitiveExperience, null)
    const [entries, setEntries] = useState<ExperienceData[]>(() => parseExperienceList(value))

    const normalizedEntries = useMemo(
        () => entries.map((entry) => ({
            year: entry.year.trim(),
            role: entry.role.trim(),
            game: entry.game.trim(),
            team: entry.team.trim(),
            highlights: entry.highlights.trim(),
        })),
        [entries]
    )

    const meaningfulEntries = normalizedEntries.filter(isEntryMeaningful)

    function updateEntry(index: number, key: keyof ExperienceData, nextValue: string) {
        setEntries((prev) =>
            prev.map((entry, i) => (i === index ? { ...entry, [key]: nextValue } : entry))
        )
    }

    function addEntry() {
        if (entries.length >= 10) {
            toast.error('Maximum 10 experiences allowed.')
            return
        }
        setEntries((prev) => [...prev, { ...emptyExperience }])
    }

    function removeEntry(index: number) {
        setEntries((prev) => {
            if (prev.length === 1) return prev
            return prev.filter((_, i) => i !== index)
        })
    }

    useEffect(() => {
        if (state?.error) toast.error(state.error)
        if (state?.success) toast.success(state.success)
    }, [state])

    return (
        <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm hover:border-zinc-700 transition-colors">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-white tracking-wide border-l-4 border-orange-500 pl-4 py-1">
                    Competitive Experience
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-3">
                    <input type="hidden" name="experiences_json" value={JSON.stringify(meaningfulEntries)} />

                    <div className="space-y-3">
                        {entries.map((entry, index) => (
                            <div key={index} className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Experience {index + 1}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={entries.length === 1}
                                        onClick={() => removeEntry(index)}
                                        className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase tracking-wide text-zinc-400">Year</Label>
                                        <Input
                                            value={entry.year}
                                            onChange={(e) => updateEntry(index, 'year', e.target.value)}
                                            placeholder="2024 - Present"
                                            className="bg-[#120D0C] border-zinc-700 text-zinc-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase tracking-wide text-zinc-400">Role</Label>
                                        <Input
                                            value={entry.role}
                                            onChange={(e) => updateEntry(index, 'role', e.target.value)}
                                            placeholder="IGL / Duelist"
                                            className="bg-[#120D0C] border-zinc-700 text-zinc-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase tracking-wide text-zinc-400">Game</Label>
                                        <Input
                                            value={entry.game}
                                            onChange={(e) => updateEntry(index, 'game', e.target.value)}
                                            placeholder="Valorant"
                                            className="bg-[#120D0C] border-zinc-700 text-zinc-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wide text-zinc-400">Team</Label>
                                    <Input
                                        value={entry.team}
                                        onChange={(e) => updateEntry(index, 'team', e.target.value)}
                                        placeholder="Apex Vanguard"
                                        className="bg-[#120D0C] border-zinc-700 text-zinc-100"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wide text-zinc-400">Highlights</Label>
                                    <textarea
                                        value={entry.highlights}
                                        onChange={(e) => updateEntry(index, 'highlights', e.target.value)}
                                        rows={3}
                                        placeholder="Tournament placements, achievements, and notable results..."
                                        className="w-full rounded-lg border border-zinc-700 bg-[#120D0C] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-start">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addEntry}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Experience
                        </Button>
                    </div>

                    {meaningfulEntries.length > 0 && (
                        <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                                Current Experiences on Profile
                            </p>
                            <div className="space-y-2">
                                {meaningfulEntries.map((entry, index) => (
                                    <div key={`${entry.year}-${entry.role}-${index}`} className="rounded-md border border-zinc-800 bg-[#120D0C] px-3 py-2">
                                        <p className="text-sm font-semibold text-white">
                                            {entry.role || 'Role'} · {entry.game || 'Game'}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {entry.team ? `${entry.team} · ` : ''}{entry.year || 'Year'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isPending || meaningfulEntries.length === 0}
                            className="bg-[#FF5C00] hover:bg-orange-600 text-white"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Experiences
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
