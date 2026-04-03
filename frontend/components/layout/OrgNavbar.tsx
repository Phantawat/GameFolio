'use client'

import Link from 'next/link'
import { Bell, Search, MessageSquare, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import UserDropdownMenu from '@/components/layout/UserDropdownMenu'

type OrgNavbarProps = {
  displayName: string
  handle: string
  avatarUrl?: string | null
}

export default function OrgNavbar({ displayName, handle, avatarUrl }: OrgNavbarProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Rosters', href: '/org/rosters' },
    { name: 'Post Tryout', href: '/org/tryouts/new' },
    { name: 'Applicants', href: '/org/applications' },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0F0A09]/95 backdrop-blur-md border-b',
        isScrolled ? 'border-zinc-800' : 'border-zinc-800/40'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/org/rosters" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
              <span className="text-xl font-black tracking-wide text-white">GAMEFOLIO</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white',
                    pathname.startsWith(item.href) ? 'text-orange-500' : 'text-zinc-400'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="relative w-56 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search rosters..."
                className="bg-zinc-900/50 border-zinc-800 pl-10 h-9 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-orange-500/50 rounded-full"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full w-9 h-9"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full w-9 h-9"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <UserDropdownMenu
              displayName={displayName}
              handle={handle}
              avatarUrl={avatarUrl}
              profileHref="/dashboard/player"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
