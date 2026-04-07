'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bell, LogOut, Menu, Search, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OrgNavProps } from '@/types/nav'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const orgLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Tryouts', href: '/org/tryouts' },
  { label: 'Applications', href: '/org/applications', key: 'applications' as const },
  { label: 'Roster', href: '/org/rosters' },
  { label: 'Org Settings', href: '/dashboard/settings' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname.startsWith(href)
}

function roleBadgeClasses(memberRole: OrgNavProps['memberRole']) {
  if (memberRole === 'OWNER') return 'bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/40'
  if (memberRole === 'MANAGER') return 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
  return 'bg-zinc-700 text-zinc-400 border border-zinc-600'
}

export default function OrgNavbar({
  orgName,
  orgLogoUrl,
  memberRole,
  applicationCount = 0,
  canSwitchToPlayer = true,
}: OrgNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const initial = orgName?.trim().charAt(0).toUpperCase() || 'O'

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800 bg-[#0F0A09]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/org/rosters" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 fill-orange-500 text-orange-500" />
            <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex">
            {orgLinks.map((link) => {
              const active = isActivePath(pathname, link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative border-b-2 border-transparent pb-1 text-sm transition-colors',
                    active
                      ? 'border-[#FF5C00] text-white'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {link.label}
                  {link.key === 'applications' && applicationCount > 0 && (
                    <span className="absolute -right-5 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#FF5C00] px-1 text-[11px] font-bold text-white">
                      {applicationCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative hidden w-64 2xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search tryouts..."
              className="h-9 rounded-full border-zinc-800 bg-zinc-900/50 pl-10 text-zinc-300 placeholder:text-zinc-600"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="hidden rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white md:inline-flex"
          >
            <Bell className="h-5 w-5" />
          </button>

          {canSwitchToPlayer && (
            <Link
              href="/dashboard/switch-mode?mode=player&next=%2Fdashboard%2Fplayer"
              className="hidden rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white lg:inline-flex"
            >
              Player View
            </Link>
          )}

          <form action="/auth/signout" method="post" className="hidden lg:block">
            <button
              type="submit"
              aria-label="Sign out"
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>

          <div className="hidden items-center gap-2 lg:flex">
            {orgLogoUrl ? (
              <Image
                src={orgLogoUrl}
                alt={`${orgName} logo`}
                width={34}
                height={34}
                className="h-[34px] w-[34px] rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-orange-900/30 text-sm font-bold text-[#FF5C00]">
                {initial}
              </span>
            )}

            <span className="text-[14px] font-bold text-white">{orgName}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', roleBadgeClasses(memberRole))}>
              {memberRole}
            </span>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Organization Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search tryouts..."
                    className="h-10 rounded-full border-zinc-800 bg-zinc-900/50 pl-10 text-zinc-300 placeholder:text-zinc-600"
                  />
                </div>

                {orgLinks.map((link) => {
                  const active = isActivePath(pathname, link.href)

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm',
                        active
                          ? 'border-[#FF5C00]/40 bg-[#FF5C00]/10 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      )}
                    >
                      <span>{link.label}</span>
                      {link.key === 'applications' && applicationCount > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#FF5C00] px-1 text-[11px] font-bold text-white">
                          {applicationCount}
                        </span>
                      )}
                    </Link>
                  )
                })}

                {canSwitchToPlayer && (
                  <Link
                    href="/dashboard/switch-mode?mode=player&next=%2Fdashboard%2Fplayer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <span>Switch to Player View</span>
                  </Link>
                )}

                <form action="/auth/signout" method="post" className="pt-2">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
