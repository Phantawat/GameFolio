'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Upload, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { deletePlayerHighlight, uploadPlayerHighlight } from '../actions'
import type { PlayerHighlightRow } from '@/lib/queries'

type VodsProps = {
    highlights: PlayerHighlightRow[]
}

function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function Vods({ highlights }: VodsProps) {
    const [uploadState, uploadAction, isUploading] = useActionState(uploadPlayerHighlight, null)
    const [deleteState, deleteAction, isDeleting] = useActionState(deletePlayerHighlight, null)
    const [durationSeconds, setDurationSeconds] = useState(0)

    useEffect(() => {
        if (uploadState?.error) toast.error(uploadState.error)
        if (uploadState?.success) toast.success(uploadState.success)
    }, [uploadState])

    useEffect(() => {
        if (deleteState?.error) toast.error(deleteState.error)
        if (deleteState?.success) toast.success(deleteState.success)
    }, [deleteState])

    async function handleVideoSelected(file: File | null) {
        if (!file) {
            setDurationSeconds(0)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.preload = 'metadata'

        await new Promise<void>((resolve) => {
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(objectUrl)
                const seconds = Math.round(video.duration || 0)
                setDurationSeconds(seconds)
                resolve()
            }
            video.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                setDurationSeconds(0)
                resolve()
            }
            video.src = objectUrl
        })
    }

    return (
        <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-white">Match Highlights</CardTitle>
                <span className="text-xs text-zinc-500">Max length: 2:00</span>
            </CardHeader>

            <CardContent className="space-y-5 pb-6">
                <form action={uploadAction} className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-800 bg-[#0F0A09] p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                    <Input
                        name="title"
                        required
                        placeholder="Highlight title"
                        className="bg-zinc-900/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                    />
                    <Input
                        name="video"
                        type="file"
                        required
                        accept="video/*"
                        onChange={(e) => void handleVideoSelected(e.target.files?.[0] ?? null)}
                        className="bg-zinc-900/60 border-zinc-700 text-zinc-300"
                    />
                    <input type="hidden" name="duration_seconds" value={durationSeconds} />
                    <div className="md:col-span-3 flex items-center justify-between">
                        <p className={`text-xs ${durationSeconds > 120 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {durationSeconds > 0
                                ? `Detected duration: ${formatDuration(durationSeconds)}`
                                : 'Select a video to validate duration.'}
                        </p>
                        <Button
                            type="submit"
                            disabled={isUploading || durationSeconds <= 0 || durationSeconds > 120}
                            className="bg-[#FF5C00] hover:bg-orange-600 text-white"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Highlight
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {highlights.length === 0 ? (
                        <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-4 text-sm text-zinc-500">
                            No highlight videos uploaded yet.
                        </div>
                    ) : (
                        highlights.map((highlight) => (
                            <div key={highlight.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                                <video
                                    controls
                                    className="aspect-video w-full rounded-lg border border-zinc-800 bg-black"
                                    src={highlight.video_url}
                                />
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-white line-clamp-1">{highlight.title}</p>
                                        <p className="text-xs text-zinc-500">{formatDuration(highlight.duration_seconds)}</p>
                                    </div>
                                    <form action={deleteAction}>
                                        <input type="hidden" name="highlight_id" value={highlight.id} />
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            size="icon"
                                            disabled={isDeleting}
                                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
