import { cn } from '@/lib/utils'

interface GameIconProps {
  gameName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export function GameIcon({ gameName, className, size = 'md' }: GameIconProps) {
  const initials = gameName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-zinc-400 shrink-0',
        sizeClasses[size],
        className
      )}
      title={gameName}
    >
      {initials}
    </div>
  )
}
