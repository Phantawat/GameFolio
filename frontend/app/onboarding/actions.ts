'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const gamertag = formData.get('gamertag') as string
  const bio = formData.get('bio') as string
  const region = formData.get('region') as string

  // Insert into player_profiles
  const { error } = await supabase
    .from('player_profiles')
    .insert({
      user_id: user.id,
      gamertag: gamertag,
      bio: bio,
      region: region,
    })

  if (error) {
    console.error('Onboarding Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard/player')
}
