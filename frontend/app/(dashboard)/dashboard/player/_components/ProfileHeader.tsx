'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Camera, Copy, Loader2, MapPin, MoreHorizontal, Pencil, Users } from 'lucide-react'
import { toast } from 'sonner'
import { togglePlayerAvailability, uploadPlayerAvatar } from '../actions'

interface ProfileHeaderProps {
  gamertag?: string | null
  region?: string | null
  avatarUrl?: string | null
  seekingTeam?: boolean | null
}

export function ProfileHeader({ gamertag, region, avatarUrl, seekingTeam }: ProfileHeaderProps) {
  const router = useRouter()
  const [uploadState, uploadAction, isUploading] = useActionState(uploadPlayerAvatar, null)
  const [availabilityState, availabilityAction, isAvailabilityPending] = useActionState(
    togglePlayerAvailability,
    null
  )
  const formRef = useRef<HTMLFormElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isSeekingTeam = seekingTeam ?? true

  async function copyProfileLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard/player`)
      toast.success('Profile link copied.')
    } catch {
      toast.error('Failed to copy link. Please try again.')
    }
  }

  useEffect(() => {
    if (!uploadState) return
    if (uploadState.error) toast.error(uploadState.error)
    if (uploadState.success) toast.success(uploadState.success)
  }, [uploadState])

  useEffect(() => {
    if (!availabilityState) return
    if (availabilityState.error) {
      toast.error(availabilityState.error)
      return
    }
    if (availabilityState.success) {
      toast.success(availabilityState.success)
      router.refresh()
    }
  }, [availabilityState, router])

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#140C0B] overflow-hidden relative shadow-md group">
      {/* Banner/Background - Abstract Landscape */}
      <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1624138784181-dc7cc7574519?q=80&w=2670&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#140C0B] via-[#140C0B]/30 to-transparent"></div>
      </div>

      <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-16 gap-6 relative z-10 w-full">
           {/* Avatar with Status Dot */}
           <div className="relative group/avatar shrink-0">
              <Avatar className="w-32 h-32 md:w-36 md:h-36 border-[6px] border-[#140C0B] rounded-full shadow-2xl bg-zinc-800">
                  <AvatarImage src={avatarUrl ?? ''} alt={gamertag || "Player"} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-zinc-800 text-zinc-400 border-2 border-zinc-700">{gamertag?.substring(0, 2).toUpperCase() || "PL"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#140C0B]"></div>

              <form ref={formRef} action={uploadAction} className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <input
                  ref={inputRef}
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={() => formRef.current?.requestSubmit()}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-zinc-700 bg-[#0F0A09] px-2 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                  Avatar
                </button>
              </form>
           </div>
           
           {/* Player Info */}
           <div className="flex-1 pb-1 space-y-1 w-full text-center md:text-left">
               <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                   <h1 className="text-4xl font-extrabold text-white tracking-tight">{gamertag || "Ganzanarak"}</h1>
                   <Badge
                     className={
                       isSeekingTeam
                         ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 h-6 rounded'
                         : 'bg-zinc-700/30 text-zinc-300 hover:bg-zinc-700/40 border border-zinc-600/40 uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 h-6 rounded'
                     }
                   >
                     {isSeekingTeam ? 'Looking for Team' : 'Not Looking'}
                   </Badge>
               </div>
               
               <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium justify-center md:justify-start">
                   <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{region || "South East Asia (SEA)"}</span>
                   </div>
                   <span className="text-zinc-600">•</span>
                     <span className="text-zinc-300">{isSeekingTeam ? 'Free Agent' : 'Status Hidden'}</span>
               </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pb-1 justify-center md:justify-end">
               <Button className="bg-[#FF5C00] hover:bg-[#E65200] text-white font-bold px-6 shadow-lg shadow-orange-900/20 transition-all hover:scale-105 active:scale-95 h-10">
                 <Pencil className="mr-2 h-4 w-4" />
                 Edit Profile
               </Button>

               <Sheet>
                 <SheetTrigger asChild>
                   <Button
                     variant="outline"
                     size="icon"
                     className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10"
                   >
                     <MoreHorizontal className="w-5 h-5" />
                     <span className="sr-only">Profile actions</span>
                   </Button>
                 </SheetTrigger>
                 <SheetContent>
                   <SheetHeader>
                     <SheetTitle>Profile Actions</SheetTitle>
                   </SheetHeader>

                   <div className="space-y-3">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={copyProfileLink}
                       className="w-full justify-start border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-800"
                     >
                       <Copy className="mr-2 h-4 w-4" />
                       Copy Profile Link
                     </Button>

                     <form action={availabilityAction}>
                       <input type="hidden" name="seeking_team" value={isSeekingTeam ? 'false' : 'true'} />
                       <Button
                         type="submit"
                         disabled={isAvailabilityPending}
                         variant="outline"
                         className="w-full justify-start border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-800"
                       >
                         {isAvailabilityPending ? (
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                           <Users className="mr-2 h-4 w-4" />
                         )}
                         {isSeekingTeam ? 'Mark as Not Looking' : 'Mark as Looking for Team'}
                       </Button>
                     </form>

                     <SheetClose asChild>
                       <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">
                         Close
                       </Button>
                     </SheetClose>
                   </div>
                 </SheetContent>
               </Sheet>
           </div>
      </div>
    </div>
  )
}
