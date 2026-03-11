import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function Vods() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm">
       <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">Match Highlights</CardTitle>
            <Button variant="link" className="text-[#FF5C00] hover:text-[#E65200] p-0 h-auto text-sm font-semibold">View All</Button>
       </CardHeader>
       <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
           {/* VOD 1 */}
           <div className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer shadow-lg transition-transform hover:-translate-y-1">
               {/* Thumbnail Placeholder */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
               
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px] group-hover:backdrop-blur-none">
                   <div className="w-14 h-14 rounded-full bg-[#FF5C00] flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.5)] transform group-hover:scale-110 transition-transform duration-300 group-active:scale-95">
                       <Play className="w-6 h-6 text-white ml-1 fill-white" />
                   </div>
               </div>
               
               {/* Content Overlay */}
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                   <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-orange-100 transition-colors">Clutch 1v4 ACE on Haven - VCT Quals</p>
                   <div className="flex items-center justify-between mt-1">
                       <span className="text-xs text-zinc-400 font-medium">2 weeks ago • 1.2k views</span>
                       <span className="text-[10px] font-bold bg-black/80 text-white px-2 py-0.5 rounded border border-zinc-700/50">02:45</span>
                   </div>
               </div>
           </div>
           
           {/* VOD 2 */}
           <div className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer shadow-lg transition-transform hover:-translate-y-1">
               {/* Thumbnail Placeholder */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>

               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px] group-hover:backdrop-blur-none">
                   <div className="w-14 h-14 rounded-full bg-[#FF5C00] flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.5)] transform group-hover:scale-110 transition-transform duration-300 group-active:scale-95">
                       <Play className="w-6 h-6 text-white ml-1 fill-white" />
                   </div>
               </div>
               
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                   <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-orange-100 transition-colors">Ascent Jett Movement Montage</p>
                   <div className="flex items-center justify-between mt-1">
                       <span className="text-xs text-zinc-400 font-medium">1 month ago • 850 views</span>
                       <span className="text-[10px] font-bold bg-black/80 text-white px-2 py-0.5 rounded border border-zinc-700/50">01:12</span>
                   </div>
               </div>
           </div>
       </CardContent>
    </Card>
  )
}
