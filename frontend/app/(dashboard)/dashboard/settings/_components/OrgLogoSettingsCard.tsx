'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateOrganizationLogo } from '../actions'

type OrgLogoSettingsCardProps = {
  orgName: string
  logoUrl: string | null
}

export default function OrgLogoSettingsCard({ orgName, logoUrl }: OrgLogoSettingsCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl)
  const [state, action, isPending] = useActionState(updateOrganizationLogo, null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!state) return
    if (state.error) toast.error(state.error)
    if (state.success) toast.success(state.success)
  }, [state])

  return (
    <Card className="bg-[#140C0B] border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Organization Branding</CardTitle>
        <CardDescription className="text-zinc-400">
          Update the logo used across org views and tryout listings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
            {previewUrl ? (
              <Image src={previewUrl} alt={`${orgName} logo`} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                {orgName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-100">{orgName}</p>
            <p className="text-xs text-zinc-500">PNG, JPG, WEBP. Max 5MB.</p>
          </div>

          <form ref={formRef} action={action}>
            <input
              ref={inputRef}
              type="file"
              name="logo"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (!file) return
                setPreviewUrl(URL.createObjectURL(file))
                formRef.current?.requestSubmit()
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Update Logo
            </button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
