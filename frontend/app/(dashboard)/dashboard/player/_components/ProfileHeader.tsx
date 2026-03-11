import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, MoreHorizontal } from 'lucide-react'

interface ProfileHeaderProps {
  gamertag?: string | null
  region?: string | null
  avatarUrl?: string | null
}

export function ProfileHeader({ gamertag, region, avatarUrl }: ProfileHeaderProps) {
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
                  <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} alt={gamertag || "Player"} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-zinc-800 text-zinc-400 border-2 border-zinc-700">{gamertag?.substring(0, 2).toUpperCase() || "PL"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#140C0B]"></div>
           </div>
           
           {/* Player Info */}
           <div className="flex-1 pb-1 space-y-1 w-full text-center md:text-left">
               <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                   <h1 className="text-4xl font-extrabold text-white tracking-tight">{gamertag || "Ganzanarak"}</h1>
                   <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 h-6 rounded">
                       Looking for Team
                   </Badge>
               </div>
               
               <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium justify-center md:justify-start">
                   <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{region || "South East Asia (SEA)"}</span>
                   </div>
                   <span className="text-zinc-600">•</span>
                   <span className="text-zinc-300">Free Agent</span>
               </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pb-1 justify-center md:justify-end">
               <Button className="bg-[#FF5C00] hover:bg-[#E65200] text-white font-bold px-6 shadow-lg shadow-orange-900/20 transition-all hover:scale-105 active:scale-95 h-10">
                   Invite to Tryout
               </Button>
               <Button variant="outline" size="icon" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10">
                   <MoreHorizontal className="w-5 h-5" />
               </Button>
           </div>
      </div>
    </div>
  )
}
