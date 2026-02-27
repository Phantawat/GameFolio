'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Gamepad2, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
            <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Tryouts
            </Link>
            <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Player Directory
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Mobile Menu (Simplified) */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
