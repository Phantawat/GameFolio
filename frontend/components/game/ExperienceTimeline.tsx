import { cn } from '@/lib/utils'

export interface TimelineEntry {
  role: string
  organization: string
  dateRange: string
  isCurrent?: boolean
}

interface ExperienceTimelineProps {
  entries: TimelineEntry[]
}

export function ExperienceTimeline({ entries }: ExperienceTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-zinc-500 text-sm italic">No experience entries yet.</p>
    )
  }

  return (
    <div className="relative space-y-6 pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-1 bottom-1 w-px bg-zinc-800" />

      {entries.map((entry, idx) => (
        <div key={idx} className="relative flex gap-4">
          {/* Dot */}
          <div
            className={cn(
              'absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 shrink-0',
              entry.isCurrent
                ? 'bg-[#FF5C00] border-[#FF5C00]/40'
                : 'bg-zinc-700 border-zinc-600'
            )}
          />

          {/* Content */}
          <div className="min-w-0">
            <p
              className={cn(
                'font-bold text-sm',
                entry.isCurrent ? 'text-[#FF5C00]' : 'text-zinc-300'
              )}
            >
              {entry.role}
            </p>
            <p className="text-zinc-400 text-sm">{entry.organization}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{entry.dateRange}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
