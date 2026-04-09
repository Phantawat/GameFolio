'use client'

import Link from 'next/link'
import { Menu, ShieldCheck, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import UserDropdownMenu from '@/components/layout/UserDropdownMenu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type AdminNavbarProps = {
  displayName: string
  handle: string
}

const adminLinks = [
  { label: 'Admin Home', href: '/admin' },
  { label: 'Player Dashboard', href: '/dashboard/player' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

export default function AdminNavbar({ displayName, handle }: AdminNavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800 bg-[#0F0A09]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 fill-orange-500 text-orange-500" />
            <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
            <span className="hidden rounded-full border border-[#FF5C00]/30 bg-[#FF5C00]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FF5C00] sm:inline-flex">
              Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {adminLinks.map((link) => {
              const active = isActivePath(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative border-b-2 border-transparent pb-1 text-sm transition-colors',
                    active ? 'border-[#FF5C00] text-white' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-300 lg:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF5C00]" />
            Platform Admin
          </span>

          <UserDropdownMenu displayName={displayName} handle={handle} profileHref="/admin" />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open admin navigation menu"
                className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Admin Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                {adminLinks.map((link) => {
                  const active = isActivePath(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block rounded-md border border-transparent px-3 py-2 text-sm',
                        active
                          ? 'border-[#FF5C00]/40 bg-[#FF5C00]/10 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}