'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { toast } from 'sonner'
import { useActionState, useState, useEffect } from 'react'
import { Eye, EyeOff, Gamepad2, Sparkles, Loader2, Flame, Play } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const [flashMessage] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('message')
  })
  const [showPassword, setShowPassword] = useState(false)
  
  const [state, action, isPending] = useActionState(login, null)

  useEffect(() => {
    if (flashMessage) {
      toast.info(flashMessage)
    }
  }, [flashMessage])

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050304] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,84,20,0.22),transparent_45%),radial-gradient(circle_at_80%_25%,rgba(255,120,40,0.14),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,60,0,0.2),transparent_50%)]" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#ff5c00]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-12 h-72 w-72 rounded-full bg-[#ff7a1a]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5),rgba(5,3,4,0.9))]" />
      </div>

      <Link href="/" className="absolute left-6 top-6 z-10 flex items-center gap-2">
        <Sparkles className="h-6 w-6 fill-orange-500 text-orange-500" />
        <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
      </Link>

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#120b0a]/80 shadow-2xl backdrop-blur-sm">
        <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-zinc-800/70 p-10 lg:block">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,7,7,0.55),rgba(14,9,8,0.85))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,92,0,0.35),transparent_45%)]" />

            <div className="relative flex h-full flex-col justify-between">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FF5C00]/30 bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF8A3D]">
                <Flame className="h-3.5 w-3.5" />
                Gamer Network
              </div>

              <div className="space-y-4">
                <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight text-white">
                  Fire Up Your Esports Career
                </h2>
                <p className="max-w-md text-sm leading-7 text-zinc-300">
                  Build your verified profile, showcase your performance, and connect with organizations that are actively scouting talent.
                </p>
                <Button asChild className="h-11 rounded-full bg-[#FF5C00] px-8 font-bold text-white hover:bg-orange-600">
                  <Link href="/"> 
                    <Play className="mr-2 h-4 w-4" />
                    Explore GameFolio
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="flex items-center px-6 py-8 sm:px-10">
            <div className="w-full space-y-5">
              <div className="space-y-3 text-center lg:text-left">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#FF5C00]/30 bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF8A3D] lg:mx-0">
                  <Flame className="h-3.5 w-3.5" />
                  Sign In
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">Welcome Back</h1>
                <p className="text-sm text-zinc-400">Sign in to continue your grind.</p>
              </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-11 border-zinc-700 bg-[#0F0A09] text-zinc-50 placeholder:text-zinc-600 focus-visible:border-[#FF5C00]/60 focus-visible:ring-[#FF5C00]/35"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 font-medium">Password</Label>
                <Link href="#" className="text-xs text-orange-500 hover:text-orange-400 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="h-11 border-zinc-700 bg-[#0F0A09] pr-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:border-[#FF5C00]/60 focus-visible:ring-[#FF5C00]/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="mt-2 h-11 w-full bg-[#FF5C00] font-bold text-white hover:bg-orange-600">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

              <div className="relative flex items-center py-1">
                <Separator className="flex-1 bg-zinc-800" />
                <span className="px-2 text-xs uppercase text-zinc-500">Or</span>
                <Separator className="flex-1 bg-zinc-800" />
              </div>

              <Button variant="secondary" className="h-11 w-full border-0 bg-[#5865F2] font-semibold text-white hover:bg-[#4752C4]">
                <Gamepad2 className="mr-2 h-5 w-5" />
                Sign in with Discord
              </Button>

              <div className="pt-1 text-center text-sm text-zinc-400">
                Don&apos;t have an account?
                <Link href="/signup" className="ml-1 font-medium text-orange-500 hover:text-orange-400">
                  Sign Up
                </Link>
              </div>
            </div>
          </section>
        </div>
          </div>
    </div>
  )
}
