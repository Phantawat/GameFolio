import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export function ProfileHeader() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#140C0B] overflow-hidden relative">
      {/* Banner/Background - Simulated */}
      <div className="h-32 bg-gradient-to-r from-zinc-900 to-zinc-800 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge variant="outline" className="border-green-800 bg-green-900/20 text-green-400">Looking for Team</Badge>
          <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              Invite to Tryout
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8 flex items-end -mt-12 gap-6 relative">
           <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#140C0B] rounded-full">
                  <AvatarImage src="https://ui.shadcn.com/avatars/04.png" alt="NeonSpecter" />
                  <AvatarFallback>NS</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#140C0B]"></div>
           </div>
           
           <div className="flex-1 pb-2">
               <h1 className="text-3xl font-bold text-white">NeonSpecter</h1>
               <div className="flex items-center gap-2 text-zinc-400 mt-1">
                   <MapPin className="w-4 h-4" />
                   <span>EU West</span>
               </div>
           </div>
      </div>
    </div>
  )
}
