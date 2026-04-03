'use client'

import { Badge } from '@/components/ui/badge'
import { Gamepad2, Users, MapPin, Clock } from 'lucide-react'

interface TryoutCardProps {
  id: string
  title: string
  requirements: string | null
  createdAt: string
  org: { name: string; logo_url: string | null; region: string | null } | null
  game: { name: string } | null
  role: { role_name: string } | null
  footer?: React.ReactNode
}

export function TryoutCard({
  title,
  requirements,
  createdAt,
  org,
  game,
  role,
  footer,
}: TryoutCardProps) {
  return (
    <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF5C00] to-orange-400" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Org info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-black text-zinc-400 shrink-0 overflow-hidden">
            {org?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logo_url}
                alt={org?.name ?? 'Organization'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(org?.name ?? 'O').charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate leading-tight">
              {org?.name ?? 'Unknown Org'}
            </p>
            {org?.region && (
              <div className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{org.region}</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-base leading-tight group-hover:text-[#FF5C00] transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {game && (
            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 text-xs gap-1">
              <Gamepad2 className="w-3 h-3" />
              {game.name}
            </Badge>
          )}
          {role && (
            <Badge className="bg-[#FF5C00]/10 text-[#FF5C00] border-[#FF5C00]/20 text-xs gap-1">
              <Users className="w-3 h-3" />
              {role.role_name}
            </Badge>
          )}
        </div>

        {/* Requirements */}
        {requirements && (
          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 flex-1">
            {requirements}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          {footer && <div className="w-32">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
