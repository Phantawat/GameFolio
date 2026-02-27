'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Attempt to log in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    // Return the error string so your UI can display it
    return { error: authError.message }
  }

  // 2. Check if the user has completed onboarding
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  revalidatePath('/', 'layout')

  // 3. Route based on profile existence
  if (!profile) {
    redirect('/onboarding')
  }

  // Note: Later you can check the `user_roles` table here to route to /dashboard/org 
  // if they are a recruiter instead of a player!
  redirect('/dashboard/player')
}

export async function signup(formData: FormData) {
  console.log('Signup action called')
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  console.log('Attempting signup for:', email)

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup error:', error)
    // Return the error string so your UI can display it inline
    return { error: error.message }
  }

  console.log('Signup successful, data:', data)

  revalidatePath('/', 'layout')
  
  // Assuming you have "Confirm Email" turned ON in Supabase Auth settings
  redirect('/login?message=Check your email to confirm your account.')
}