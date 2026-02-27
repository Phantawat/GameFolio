import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function Experience() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100">
        <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Competitive Experience</CardTitle>
        </CardHeader>
        <CardContent className="relative pl-6 border-l border-zinc-800 ml-6 space-y-8">
             {/* Experience Item 1 */}
             <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-[#140C0B] border border-zinc-700 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="font-bold text-white">Apex Vanguard</h3>
                              <p className="text-blue-400 text-sm font-medium">Lead Entry Fragger</p>
                          </div>
                          <span className="text-xs text-zinc-500">2023 - Present</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                          Qualified for VCT Challengers Stage 2.<br/>
                          Finished Top 4 in the Winter Invitational.
                      </p>
                  </div>
             </div>

             {/* Experience Item 2 */}
             <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-8 h-8 rounded-full bg-[#140C0B] border border-zinc-700 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg opacity-80">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="font-bold text-white">Project Zero</h3>
                              <p className="text-blue-400 text-sm font-medium">Duelist Main</p>
                          </div>
                          <span className="text-xs text-zinc-500">2022 - 2023</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                          Maintained 1.4 K/D throughout regional qualifiers. Led the team to victory in the Community Cup #14.
                      </p>
                  </div>
             </div>
        </CardContent>
    </Card>
  )
}
