'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboarding } from './actions'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'
import { useEffect } from 'react'

const initialState = {
  error: '',
}

export default function OnboardingPage() {
  const [state, formAction] = useFormState(completeOnboarding, initialState)

  useEffect(() => {
    if (state?.error) {
      toast.error('Failed to create profile: ' + state.error)
    }
  }, [state])

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Setup Your Gamer Profile</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            One last step to access GameFolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gamertag">Gamertag</Label>
              <Input 
                id="gamertag" 
                name="gamertag" 
                placeholder="xX_NoobSlayer_Xx" 
                required 
                className="bg-zinc-950 border-zinc-700 text-zinc-50"
              />
              <p className="text-xs text-zinc-500">This will be your public username.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input 
                id="region" 
                name="region" 
                placeholder="NA, EU, SEA..." 
                required 
                className="bg-zinc-950 border-zinc-700 text-zinc-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Input 
                id="bio" 
                name="bio" 
                placeholder="Tell us about your gaming history..." 
                className="bg-zinc-950 border-zinc-700 text-zinc-50"
              />
            </div>
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
