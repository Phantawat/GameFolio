'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
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

function parseExperience(value?: string | null): ExperienceData {
    const empty: ExperienceData = {
        year: '',
        role: '',
        game: '',
        team: '',
        highlights: '',
    }

    if (!value) return empty

    try {
        const parsed = JSON.parse(value) as Partial<ExperienceData>
        return {
            year: parsed.year ?? '',
            role: parsed.role ?? '',
            game: parsed.game ?? '',
            team: parsed.team ?? '',
            highlights: parsed.highlights ?? '',
        }
    } catch {
        return {
            ...empty,
            highlights: value,
        }
    }
}

export function Experience({ value }: ExperienceProps) {
    const [state, formAction, isPending] = useActionState(updateCompetitiveExperience, null)
    const initial = parseExperience(value)

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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="exp-year" className="text-xs uppercase tracking-wide text-zinc-400">
                                Year
                            </Label>
                            <Input
                                id="exp-year"
                                name="year"
                                required
                                defaultValue={initial.year}
                                placeholder="2024 - Present"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="exp-role" className="text-xs uppercase tracking-wide text-zinc-400">
                                Role
                            </Label>
                            <Input
                                id="exp-role"
                                name="role"
                                required
                                defaultValue={initial.role}
                                placeholder="IGL / Duelist"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="exp-game" className="text-xs uppercase tracking-wide text-zinc-400">
                                Game
                            </Label>
                            <Input
                                id="exp-game"
                                name="game"
                                required
                                defaultValue={initial.game}
                                placeholder="Valorant"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="exp-team" className="text-xs uppercase tracking-wide text-zinc-400">
                            Team
                        </Label>
                        <Input
                            id="exp-team"
                            name="team"
                            defaultValue={initial.team}
                            placeholder="Apex Vanguard"
                            className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                        />
                    </div>

                    <textarea
                        name="highlights"
                        defaultValue={initial.highlights}
                        rows={5}
                        placeholder="Add achievements, tournament placements, and key results..."
                        className="w-full rounded-lg border border-zinc-700 bg-[#0F0A09] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending} className="bg-[#FF5C00] hover:bg-orange-600 text-white">
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Experience
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
