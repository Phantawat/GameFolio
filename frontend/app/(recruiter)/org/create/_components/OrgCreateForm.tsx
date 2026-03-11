'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createOrganization } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Camera, Globe, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function OrgCreateForm() {
  const [state, formAction, isPending] = useActionState(createOrganization, null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  return (
    <div className="w-full max-w-md bg-[#140C0B] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white">Create Your Organization</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Set up your official presence to start recruiting.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {/* Logo Upload */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-zinc-600 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-1 group overflow-hidden"
          >
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                className="object-cover"
              />
            ) : (
              <>
                <Camera className="w-6 h-6 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                <span className="text-[10px] text-zinc-500 group-hover:text-orange-400 font-bold uppercase tracking-wider transition-colors">
                  Upload Logo
                </span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>

        {/* Organization Name */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">
            Organization Name
          </Label>
          <Input
            name="name"
            required
            placeholder="e.g. Cloud9, Team Liquid"
            className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-11"
          />
        </div>

        {/* Website URL */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">
            Website URL
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              name="website_url"
              type="url"
              placeholder="https://organization.com"
              className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-11 pl-10"
            />
          </div>
        </div>

        {/* Twitter / X Handle */}
        <div className="space-y-1.5">
          <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">
            Twitter/X Handle
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium select-none">
              @
            </span>
            <Input
              name="twitter_handle"
              placeholder="handle"
              className="bg-[#0F0A09] border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 h-11 pl-8"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#FF5C00] hover:bg-orange-600 text-white font-black text-base mt-6"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Create Organization Profile'
          )}
        </Button>

        <p className="text-center text-xs text-zinc-600 mt-2">
          By creating an organization, you agree to GameFolio&apos;s{' '}
          <span className="text-zinc-400 underline cursor-pointer">Terms of Service</span>
        </p>
      </form>
    </div>
  )
}
