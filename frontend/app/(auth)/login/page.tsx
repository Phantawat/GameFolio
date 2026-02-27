'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Eye, EyeOff, Gamepad2, Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (message) {
      toast.info(message)
    }
  }, [message])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
        <span className="text-xl font-black tracking-wide text-orange-500">GAMEFOLIO</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-white">Welcome Back</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  className="bg-zinc-950/50 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 h-10"
                />
              </div>
              <div className="space-y-2">
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
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    required 
                    className="bg-zinc-950/50 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 h-10 pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10 mt-2">
                Sign In
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <Separator className="flex-1 bg-zinc-800" />
              <span className="px-2 text-xs text-zinc-500 uppercase">Or</span>
              <Separator className="flex-1 bg-zinc-800" />
            </div>

            <Button variant="secondary" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold h-10 flex items-center gap-2 border-0">
               <Gamepad2 className="w-5 h-5" /> 
               Sign in with Discord
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 pt-2">
            <div className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-orange-500 hover:text-orange-400 font-medium ml-1">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 bg-zinc-950 text-center text-xs text-zinc-600">
        <p>&copy; 2026 GameFolio. All rights reserved.</p>
      </footer>
    </div>
  )
}
