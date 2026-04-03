import { Trophy, Clock3 } from 'lucide-react'

export const metadata = {
  title: 'Tournaments | GameFolio',
  description: 'Track tournament activity and upcoming competition support.',
}

export default function TournamentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold">Dashboard</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Tournaments</h1>
        <p className="text-zinc-400 text-sm">
          Tournament tracking is being finalized. Your player and organization core flows are live now.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#140C0B] p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-[#FF5C00]/30 bg-[#FF5C00]/10 p-3 text-[#FF5C00]">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Coming Soon</h2>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              This section is reserved for bracket tracking, participation history, and performance summaries.
              Until then, use Tryouts and Applications to manage your active progress.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              <Clock3 className="h-3.5 w-3.5" />
              In rollout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
