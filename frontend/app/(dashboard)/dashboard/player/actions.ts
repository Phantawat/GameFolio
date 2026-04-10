'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'
import type { ActionResult } from '@/lib/safe-action'
import { createClient } from '@/lib/supabase/server'

// ─── Schema ───────────────────────────────────────────────────────────────────

const gameStatsSchema = z.object({
  game_id: z.string().uuid('Please select a game'),
  main_role_id: z.string().uuid('Please select a role').optional().or(z.literal('')),
  rank: z.string().min(1, 'Rank is required'),
  mmr: z.coerce.number().int().min(0).max(99999).optional().or(z.literal('')),
  win_rate: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  hours_played: z.coerce.number().int().min(0).optional().or(z.literal('')),
})

const playerProfileSchema = z.object({
  gamertag: z.string().trim().min(2, 'Gamertag must be at least 2 characters').max(32),
  region: z.string().trim().max(32).optional().or(z.literal('')),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or fewer').optional().or(z.literal('')),
})

const playerExtrasSchema = z.object({
  competitive_experience: z
    .string()
    .trim()
    .max(3000, 'Competitive experience must be 3000 characters or fewer')
    .optional()
    .or(z.literal('')),
  hardware_details: z
    .string()
    .trim()
    .max(2000, 'Hardware details must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

const toggleSeekingTeamSchema = z.object({
  seeking_team: z.enum(['true', 'false']),
})

const hardwareDetailsSchema = z.object({
  mouse: z.string().trim().max(120).optional().or(z.literal('')),
  keyboard: z.string().trim().max(120).optional().or(z.literal('')),
  mousepad: z.string().trim().max(120).optional().or(z.literal('')),
  headset: z.string().trim().max(120).optional().or(z.literal('')),
  monitor: z.string().trim().max(120).optional().or(z.literal('')),
})

const competitiveExperienceStructuredSchema = z.object({
  experiences_json: z.string().min(2, 'Please add at least one experience.'),
})

const experienceEntrySchema = z.object({
  year: z.string().trim().min(1, 'Year is required').max(40, 'Year range is too long'),
  role: z.string().trim().min(1, 'Role is required').max(80, 'Role is too long'),
  game: z.string().trim().min(1, 'Game is required').max(80, 'Game name is too long'),
  team: z.string().trim().max(120).optional().default(''),
  highlights: z.string().trim().max(1000).optional().default(''),
})

// ─── Action ───────────────────────────────────────────────────────────────────

export const upsertGameStats = createSafeAction(gameStatsSchema, async (data, ctx) => {
  // Resolve the player profile for the authenticated user
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .single()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const { game_id, main_role_id, rank, mmr, win_rate, hours_played } = data

  const { error } = await ctx.supabase
    .from('player_game_stats')
    .upsert(
      {
        player_profile_id: profile.id,
        game_id,
        main_role_id: main_role_id || null,
        rank: rank ?? null,
        mmr: typeof mmr === 'number' ? mmr : null,
        win_rate: typeof win_rate === 'number' ? win_rate : null,
        hours_played: typeof hours_played === 'number' ? hours_played : null,
      },
      { onConflict: 'player_profile_id,game_id' }
    )

  if (error) {
    console.error('[upsertGameStats] DB error:', error.message, '| code:', error.code)
    return { error: error.message }
  }

  revalidatePath('/dashboard/player')
  redirect('/dashboard/player')
})

export const updatePlayerProfile = createSafeAction(playerProfileSchema, async (data, ctx) => {
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const { error } = await ctx.supabase
    .from('player_profiles')
    .update({
      gamertag: data.gamertag,
      region: data.region ? data.region : null,
      bio: data.bio ? data.bio : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'This gamertag is already taken. Please choose another one.' }
    }
    return { error: 'Failed to update profile. Please try again.' }
  }

  revalidatePath('/dashboard/player')
  return { success: 'Profile updated successfully.' }
})

export const togglePlayerAvailability = createSafeAction(
  toggleSeekingTeamSchema,
  async (data, ctx) => {
    const { data: profile } = await ctx.supabase
      .from('player_profiles')
      .select('id')
      .eq('user_id', ctx.user.id)
      .maybeSingle()

    if (!profile) {
      return { error: 'Player profile not found. Please complete onboarding first.' }
    }

    const nextSeekingTeam = data.seeking_team === 'true'

    const { error } = await ctx.supabase
      .from('player_profiles')
      .update({
        seeking_team: nextSeekingTeam,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      return { error: 'Failed to update availability. Please try again.' }
    }

    revalidatePath('/dashboard/player')
    return {
      success: nextSeekingTeam
        ? 'Status updated: Looking for Team.'
        : 'Status updated: Not Looking for Team.',
    }
  }
)

export async function uploadPlayerAvatar(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to upload an avatar.' }
  }

  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) {
    return { error: 'Please choose an image file.' }
  }

  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are allowed.' }
  }

  // Keep avatars lightweight for faster dashboard rendering.
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Avatar file is too large. Max size is 5MB.' }
  }

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: false })

  if (uploadError) {
    return { error: 'Failed to upload avatar. Please try again.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('player_profiles')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (updateError) {
    return { error: 'Avatar uploaded but profile update failed. Please try again.' }
  }

  // Best effort cleanup of previous avatar object if it was in our avatars bucket.
  if (profile.avatar_url) {
    const marker = '/storage/v1/object/public/avatars/'
    const idx = profile.avatar_url.indexOf(marker)
    const objectPath = idx >= 0 ? profile.avatar_url.slice(idx + marker.length) : null
    if (objectPath) {
      await supabase.storage.from('avatars').remove([objectPath])
    }
  }

  revalidatePath('/dashboard/player')
  revalidatePath('/dashboard')
  return { success: 'Avatar updated successfully.' }
}

export const updatePlayerExtras = createSafeAction(playerExtrasSchema, async (data, ctx) => {
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const { error } = await ctx.supabase
    .from('player_profiles')
    .update({
      competitive_experience: data.competitive_experience ? data.competitive_experience : null,
      hardware_details: data.hardware_details ? data.hardware_details : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) {
    return { error: 'Failed to update player details. Please try again.' }
  }

  revalidatePath('/dashboard/player')
  return { success: 'Experience and hardware updated.' }
})

export const updateHardwareDetails = createSafeAction(hardwareDetailsSchema, async (data, ctx) => {
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const payload = {
    mouse: data.mouse || '',
    keyboard: data.keyboard || '',
    mousepad: data.mousepad || '',
    headset: data.headset || '',
    monitor: data.monitor || '',
  }

  const hasAtLeastOneField = Object.values(payload).some((v) => v.trim().length > 0)
  if (!hasAtLeastOneField) {
    return { error: 'Please provide at least one hardware field.' }
  }

  const { error } = await ctx.supabase
    .from('player_profiles')
    .update({
      hardware_details: JSON.stringify(payload),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) {
    return { error: 'Failed to update hardware details. Please try again.' }
  }

  revalidatePath('/dashboard/player')
  return { success: 'Hardware details updated.' }
})

export const updateCompetitiveExperience = createSafeAction(
  competitiveExperienceStructuredSchema,
  async (data, ctx) => {
    const { data: profile } = await ctx.supabase
      .from('player_profiles')
      .select('id')
      .eq('user_id', ctx.user.id)
      .maybeSingle()

    if (!profile) {
      return { error: 'Player profile not found. Please complete onboarding first.' }
    }

    let parsedEntries: unknown
    try {
      parsedEntries = JSON.parse(data.experiences_json)
    } catch {
      return { error: 'Invalid experience data format.' }
    }

    const entriesSchema = z
      .array(experienceEntrySchema)
      .min(1, 'Please add at least one experience.')
      .max(10, 'Maximum 10 experiences allowed.')

    const parsed = entriesSchema.safeParse(parsedEntries)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { error: firstIssue?.message ?? 'Invalid experience entry.' }
    }

    const { error } = await ctx.supabase
      .from('player_profiles')
      .update({
        competitive_experience: JSON.stringify(parsed.data),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      return { error: 'Failed to update competitive experience. Please try again.' }
    }

    revalidatePath('/dashboard/player')
    return { success: 'Competitive experience updated.' }
  }
)

export async function uploadPlayerHighlight(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to upload highlights.' }
  }

  const title = String(formData.get('title') ?? '').trim()
  const file = formData.get('video') as File | null
  const durationRaw = Number(formData.get('duration_seconds') ?? 0)
  const durationSeconds = Number.isFinite(durationRaw) ? Math.round(durationRaw) : 0

  if (title.length < 3) {
    return { error: 'Highlight title must be at least 3 characters.' }
  }

  if (!file || file.size === 0) {
    return { error: 'Please choose a video file to upload.' }
  }

  if (!file.type.startsWith('video/')) {
    return { error: 'Only video files are allowed.' }
  }

  if (durationSeconds <= 0 || durationSeconds > 120) {
    return { error: 'Video must be shorter than 2 minutes.' }
  }

  // Keep uploads light for MVP and faster page loads.
  if (file.size > 50 * 1024 * 1024) {
    return { error: 'Video file is too large. Max size is 50MB.' }
  }

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('player_highlights')
    .upload(path, file, { upsert: false })

  if (uploadError) {
    return { error: 'Failed to upload video. Please try again.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('player_highlights').getPublicUrl(path)

  const { error: insertError } = await supabase.from('player_highlights').insert({
    player_profile_id: profile.id,
    title,
    video_url: publicUrl,
    duration_seconds: durationSeconds,
  })

  if (insertError) {
    return { error: 'Video uploaded but saving highlight failed. Please try again.' }
  }

  revalidatePath('/dashboard/player')
  return { success: 'Highlight uploaded successfully.' }
}

const deleteHighlightSchema = z.object({
  highlight_id: z.string().uuid('Invalid highlight id.'),
})

export const deletePlayerHighlight = createSafeAction(deleteHighlightSchema, async (data, ctx) => {
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const { data: highlight } = await ctx.supabase
    .from('player_highlights')
    .select('id, video_url')
    .eq('id', data.highlight_id)
    .eq('player_profile_id', profile.id)
    .maybeSingle()

  if (!highlight) {
    return { error: 'Highlight not found.' }
  }

  const url = highlight.video_url
  const marker = '/storage/v1/object/public/player_highlights/'
  const index = url.indexOf(marker)
  const objectPath = index >= 0 ? url.slice(index + marker.length) : null

  if (objectPath) {
    await ctx.supabase.storage.from('player_highlights').remove([objectPath])
  }

  const { error } = await ctx.supabase
    .from('player_highlights')
    .delete()
    .eq('id', highlight.id)

  if (error) {
    return { error: 'Failed to delete highlight. Please try again.' }
  }

  revalidatePath('/dashboard/player')
  return { success: 'Highlight deleted.' }
})
