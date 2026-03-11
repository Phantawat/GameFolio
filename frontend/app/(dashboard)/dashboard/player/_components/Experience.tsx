import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Experience() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
        <CardHeader className="pb-8">
            <CardTitle className="text-lg font-bold text-white tracking-wide border-l-4 border-orange-500 pl-4 py-1">Competitive Experience</CardTitle>
        </CardHeader>
        <CardContent className="relative pl-8 space-y-12">
             {/* Vertical Line */}
             <div className="absolute left-[39px] top-2 bottom-8 w-px bg-zinc-800 group-hover:bg-zinc-700 transition-colors"></div>

             {/* Experience Item 1 */}
             <div className="relative pl-10">
                  {/* Dot */}
                  <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,92,0,0.6)] z-10 border-2 border-[#140C0B]"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                        <div>
                            <h3 className="text-xl font-bold text-white">Apex Vanguard</h3>
                            <p className="text-[#FF5C00] font-bold text-sm mt-0.5">Lead Duelist / IGL</p>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">2023 - Present</span>
                  </div>
                  
                  <ul className="space-y-2 mt-4">
                      <li className="flex items-start gap-3 text-sm text-zinc-400 group/item hover:text-zinc-300 transition-colors">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mt-2 shrink-0 group-hover/item:bg-orange-500/50 transition-colors"></span>
                          <span className="leading-relaxed">Qualified for VCT Challengers Stage 2 Open Qualifiers</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-zinc-400 group/item hover:text-zinc-300 transition-colors">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mt-2 shrink-0 group-hover/item:bg-orange-500/50 transition-colors"></span>
                          <span className="leading-relaxed">Maintained average ACS of 245 across official tournament matches</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-zinc-400 group/item hover:text-zinc-300 transition-colors">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mt-2 shrink-0 group-hover/item:bg-orange-500/50 transition-colors"></span>
                          <span className="leading-relaxed">Orchestrated mid-round rotations and utility combos for the squad</span>
                      </li>
                  </ul>
             </div>

             {/* Experience Item 2 */}
             <div className="relative pl-10 opacity-80 hover:opacity-100 transition-opacity duration-300">
                  {/* Dot (Gray) */}
                  <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-zinc-600 z-10 border-2 border-[#140C0B]"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                        <div>
                            <h3 className="text-xl font-bold text-white">Project Zero</h3>
                            <p className="text-[#FF5C00] font-bold text-sm mt-0.5">Initiator / Support</p>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">2022 - 2023</span>
                  </div>
                  
                  <ul className="space-y-2 mt-4">
                      <li className="flex items-start gap-3 text-sm text-zinc-400 group/item hover:text-zinc-300 transition-colors">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mt-2 shrink-0 group-hover/item:bg-zinc-500 transition-colors"></span>
                          Top 8 finish in the SEA Community Invitational
                      </li>
                      <li className="flex items-start gap-3 text-sm text-zinc-400 group/item hover:text-zinc-300 transition-colors">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mt-2 shrink-0 group-hover/item:bg-zinc-500 transition-colors"></span>
                          Specialized in Sova and Fade utility lineups for site retakes
                      </li>
                      <li className="flex items-start gap-3 text-sm text-zinc-400 group/item hover:text-zinc-300 transition-colors">
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full mt-2 shrink-0 group-hover/item:bg-zinc-500 transition-colors"></span>
                          Coordinated team practice schedules and VOD review sessions
                      </li>
                  </ul>
             </div>
        </CardContent>
    </Card>
  )
}
