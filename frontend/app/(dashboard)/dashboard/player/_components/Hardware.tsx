'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Laptop, Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateHardwareDetails } from '../actions'

type HardwareProps = {
    value?: string | null
}

type HardwareData = {
    mouse: string
    keyboard: string
    mousepad: string
    headset: string
    monitor: string
}

function parseHardware(value?: string | null): HardwareData {
    const empty: HardwareData = {
        mouse: '',
        keyboard: '',
        mousepad: '',
        headset: '',
        monitor: '',
    }

    if (!value) return empty

    try {
        const parsed = JSON.parse(value) as Partial<HardwareData>
        return {
            mouse: parsed.mouse ?? '',
            keyboard: parsed.keyboard ?? '',
            mousepad: parsed.mousepad ?? '',
            headset: parsed.headset ?? '',
            monitor: parsed.monitor ?? '',
        }
    } catch {
        return {
            ...empty,
            mouse: value,
        }
    }
}

export function Hardware({ value }: HardwareProps) {
    const [state, formAction, isPending] = useActionState(updateHardwareDetails, null)
    const initial = parseHardware(value)

    useEffect(() => {
        if (state?.error) toast.error(state.error)
        if (state?.success) toast.success(state.success)
    }, [state])

    return (
        <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm transition-colors hover:border-zinc-700">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Laptop className="w-4 h-4 text-[#FF5C00]" />
                <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">Hardware</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
                <form action={formAction} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="hw-mouse" className="text-xs uppercase tracking-wide text-zinc-400">
                                Mouse
                            </Label>
                            <Input
                                id="hw-mouse"
                                name="mouse"
                                defaultValue={initial.mouse}
                                placeholder="Logitech G Pro X Superlight"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="hw-keyboard" className="text-xs uppercase tracking-wide text-zinc-400">
                                Keyboard
                            </Label>
                            <Input
                                id="hw-keyboard"
                                name="keyboard"
                                defaultValue={initial.keyboard}
                                placeholder="Wooting 60HE"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="hw-mousepad" className="text-xs uppercase tracking-wide text-zinc-400">
                                Mousepad
                            </Label>
                            <Input
                                id="hw-mousepad"
                                name="mousepad"
                                defaultValue={initial.mousepad}
                                placeholder="Artisan Zero"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="hw-headset" className="text-xs uppercase tracking-wide text-zinc-400">
                                Headset
                            </Label>
                            <Input
                                id="hw-headset"
                                name="headset"
                                defaultValue={initial.headset}
                                placeholder="HyperX Cloud II"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="hw-monitor" className="text-xs uppercase tracking-wide text-zinc-400">
                                Monitor
                            </Label>
                            <Input
                                id="hw-monitor"
                                name="monitor"
                                defaultValue={initial.monitor}
                                placeholder="BenQ XL2546K"
                                className="bg-[#0F0A09] border-zinc-700 text-zinc-100"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending} className="bg-[#FF5C00] hover:bg-orange-600 text-white">
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Hardware
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
