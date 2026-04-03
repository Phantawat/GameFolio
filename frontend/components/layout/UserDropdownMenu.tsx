'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Settings, UserCircle2, LogIn } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type UserDropdownMenuProps = {
  displayName?: string | null
  handle?: string | null
  avatarUrl?: string | null
  profileHref: string
  settingsHref?: string
  isAuthenticated?: boolean
  className?: string
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function UserDropdownMenu({
  displayName,
  handle,
  avatarUrl,
  profileHref,
  settingsHref = '/dashboard/settings',
  isAuthenticated = true,
  className,
}: UserDropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const resolvedName = displayName?.trim() || 'Guest'
  const resolvedHandle =
    handle?.trim() ||
    (resolvedName !== 'Guest' ? `@${resolvedName.toLowerCase().replace(/\s+/g, '')}` : '@guest')

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#140C0B] px-2 py-1.5 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]/50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar className="h-7 w-7 border border-zinc-700">
          <AvatarImage src={avatarUrl ?? ''} alt={resolvedName} />
          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-bold">
            {initialsFromName(resolvedName)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-zinc-800 bg-[#140C0B] shadow-xl"
        >
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-zinc-900/70"
          >
            <Avatar className="h-11 w-11 border border-zinc-700">
              <AvatarImage src={avatarUrl ?? ''} alt={resolvedName} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm font-bold">
                {initialsFromName(resolvedName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-50">{resolvedName}</p>
              <p className="truncate text-sm text-zinc-400">{resolvedHandle}</p>
            </div>
          </Link>

          <Separator className="bg-zinc-800" />

          <div className="py-1">
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900/70 hover:text-white"
            >
              <UserCircle2 className="h-4 w-4" />
              Profile
            </Link>

            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900/70 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="p-1.5">
            {isAuthenticated ? (
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900/70 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900/70 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}