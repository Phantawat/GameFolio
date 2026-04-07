'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
            <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/dashboard/tryouts" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Tryouts
            </Link>
            <Link href="/dashboard/player" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Player Directory
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Mobile Menu (Simplified) */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950/95 py-4 backdrop-blur-md lg:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/tryouts"
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tryouts
              </Link>
              <Link
                href="/dashboard/player"
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Player Directory
              </Link>
              <Link
                href="/login"
                className="pt-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="mt-1 w-full bg-orange-600 font-semibold text-white hover:bg-orange-700">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
