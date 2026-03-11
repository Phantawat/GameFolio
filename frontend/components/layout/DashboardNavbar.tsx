'use client'

import Link from 'next/link'
import { Bell, Search, Sparkles, Menu } from 'lucide-react' 
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function DashboardNavbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/player' },
    { name: 'Tryouts', href: '/dashboard/tryouts' },
    { name: 'Applications', href: '/dashboard/applications' },
    { name: 'Tournaments', href: '/dashboard/tournaments' },
    { name: 'Teams', href: '/dashboard/teams' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0F0A09]/95 backdrop-blur-md border-b ${isScrolled ? 'border-zinc-800' : 'border-zinc-800/40'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard/player" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
                <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    pathname === item.href ? "text-orange-500" : "text-zinc-400"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                    placeholder="Search tryouts..." 
                    className="bg-zinc-900/50 border-zinc-800 pl-10 h-9 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-orange-500/50 rounded-full"
                />
            </div>
            <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full w-9 h-9">
                <Bell className="w-5 h-5" />
            </Button>
             <Avatar className="h-9 w-9 border border-zinc-700">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            
             {/* Mobile Menu Toggle */}
            <div className="md:hidden">
                <Button variant="ghost" size="icon" className="text-zinc-400">
                  <Menu className="w-6 h-6" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
