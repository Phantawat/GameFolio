import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

export function Vods() {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-white">Latest VODs & Highlights</h3>
            <Button variant="link" className="text-blue-500 hover:text-blue-400 p-0 h-auto text-sm">View All</Button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-blue-500/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                       <Play className="w-5 h-5 text-white ml-1" />
                   </div>
               </div>
               <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                   <p className="font-medium text-white text-sm">Match Highlights: VCT Open Quals</p>
                   <span className="text-xs text-zinc-400">12:45 • 2 days ago</span>
               </div>
           </div>
           
           <div className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-blue-500/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                       <Play className="w-5 h-5 text-white ml-1" />
                   </div>
               </div>
               <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                   <p className="font-medium text-white text-sm">Professional Entry Guide: Ascent</p>
                   <span className="text-xs text-zinc-400">08:20 • 1 week ago</span>
               </div>
           </div>
       </div>
    </div>
  )
}
