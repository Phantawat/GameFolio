import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface StatRowProps {
  label: string
  value: string | number | null
  unit?: string
  showSeparator?: boolean
  mono?: boolean
}

export function StatRow({
  label,
  value,
  unit,
  showSeparator = true,
  mono = true,
}: StatRowProps) {
  const displayValue = value ?? '—'

  return (
    <>
      <div className="flex justify-between items-center text-sm py-1">
        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">
          {label}
        </span>
        <span
          className={cn('font-bold text-white', mono && 'font-mono tabular-nums')}
        >
          {displayValue}
          {unit && value != null && (
            <span className="text-zinc-500 ml-0.5 text-xs font-normal">{unit}</span>
          )}
        </span>
      </div>
      {showSeparator && <Separator className="bg-zinc-900" />}
    </>
  )
}
