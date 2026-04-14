import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeSupabaseMock, toFormData } from '../helpers/mock-supabase'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url })
  }),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  deletePlayerHighlight,
  togglePlayerAvailability,
  updateCompetitiveExperience,
  updateHardwareDetails,
  updatePlayerExtras,
  updatePlayerProfile,
  upsertGameStats,
  uploadPlayerAvatar,
  uploadPlayerHighlight,
} from '@/app/(dashboard)/dashboard/player/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
const VALID_GAME_ID = '550e8400-e29b-41d4-a716-446655440000'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('upsertGameStats()', () => {
  it('1: returns fieldErrors when game_id is not a UUID', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ game_id: 'not-a-uuid', rank: 'Gold' })

    const result = await upsertGameStats(null, fd)

    expect(result.fieldErrors?.game_id).toBeDefined()
  })

  it('2: returns fieldErrors when rank is empty', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: '' })

    const result = await upsertGameStats(null, fd)

    expect(result.fieldErrors?.rank).toBeDefined()
  })

  it('3: returns fieldErrors when win_rate > 100', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Gold', win_rate: '150' })

    const result = await upsertGameStats(null, fd)

    expect(result.fieldErrors?.win_rate).toBeDefined()
  })

  it('4: returns error when authenticated but player_profile not found', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }], // profile query returns null
      }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Gold' })

    const result = await upsertGameStats(null, fd)

    expect(result.error).toMatch(/player profile not found/i)
  })

  it('5: revalidates path and redirects on DB success', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null }, // player_profiles
          { data: null, error: null },                  // player_game_stats upsert
        ],
      }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Diamond', win_rate: '55' })

    await expect(upsertGameStats(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
    expect(redirect).toHaveBeenCalledWith('/dashboard/player')
  })

  it('6: returns error when DB upsert fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: { message: 'DB error occurred' } },
        ],
      }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Silver' })

    const result = await upsertGameStats(null, fd)

    expect(result).toEqual({ error: 'DB error occurred' })
  })
})

describe('uploadPlayerAvatar()', () => {
  it('1: returns error when no file is provided', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)
    const fd = new FormData()

    const result = await uploadPlayerAvatar(null, fd)

    expect(result.error).toMatch(/choose an image file/i)
  })

  it('2: returns error when file is not an image', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)
    const fd = new FormData()
    fd.append('avatar', new File([new Blob(['abc'])], 'doc.txt', { type: 'text/plain' }))

    const result = await uploadPlayerAvatar(null, fd)

    expect(result.error).toMatch(/only image files/i)
  })

  it('3: updates avatar_url and revalidates profile paths on success', async () => {
    const mockSupabase = makeSupabaseMock({
      user: MOCK_USER,
      fromChains: [
        { data: { id: 'profile-1', avatar_url: null }, error: null },
        { data: null, error: null },
      ],
    })

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = new FormData()
    fd.append('avatar', new File([new Blob(['img'])], 'avatar.png', { type: 'image/png' }))

    const result = await uploadPlayerAvatar(null, fd)

    expect(result).toEqual({ success: 'Avatar updated successfully.' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})

describe('togglePlayerAvailability()', () => {
  it('1: returns fieldErrors when seeking_team is invalid', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)
    const fd = toFormData({ seeking_team: 'maybe' })

    const result = await togglePlayerAvailability(null, fd)

    expect(result.fieldErrors?.seeking_team).toBeDefined()
  })

  it('2: returns error when player profile is not found', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }],
      }) as any
    )
    const fd = toFormData({ seeking_team: 'false' })

    const result = await togglePlayerAvailability(null, fd)

    expect(result.error).toMatch(/player profile not found/i)
  })

  it('3: updates availability and revalidates profile page', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )
    const fd = toFormData({ seeking_team: 'false' })

    const result = await togglePlayerAvailability(null, fd)

    expect(result).toEqual({ success: 'Status updated: Not Looking for Team.' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
  })
})

describe('updatePlayerProfile()', () => {
  it('1: returns duplicate-gamertag error when DB returns 23505', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: { code: '23505' } },
        ],
      }) as any
    )

    const result = await updatePlayerProfile(
      null,
      toFormData({ gamertag: 'Ace', region: 'NA', bio: 'Controller main' })
    )

    expect(result).toEqual({ error: 'This gamertag is already taken. Please choose another one.' })
  })

  it('2: returns success and revalidates path on update success', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await updatePlayerProfile(
      null,
      toFormData({ gamertag: 'Ace', region: 'NA', bio: 'IGL' })
    )

    expect(result).toEqual({ success: 'Profile updated successfully.' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
  })
})

describe('updatePlayerExtras()', () => {
  it('1: returns profile-not-found when player profile is missing', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER, fromChains: [{ data: null, error: null }] }) as any
    )

    const result = await updatePlayerExtras(
      null,
      toFormData({ competitive_experience: 'Tier 2', hardware_details: 'Logitech setup' })
    )

    expect(result.error).toMatch(/player profile not found/i)
  })

  it('2: returns success when extras update succeeds', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await updatePlayerExtras(
      null,
      toFormData({ competitive_experience: 'Tier 2 LAN', hardware_details: '240hz monitor' })
    )

    expect(result).toEqual({ success: 'Experience and hardware updated.' })
  })
})

describe('updateHardwareDetails()', () => {
  it('1: returns error when all hardware fields are empty', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER, fromChains: [{ data: { id: 'profile-1' }, error: null }] }) as any
    )

    const result = await updateHardwareDetails(
      null,
      toFormData({ mouse: '', keyboard: '', mousepad: '', headset: '', monitor: '' })
    )

    expect(result).toEqual({ error: 'Please provide at least one hardware field.' })
  })

  it('2: returns success when one or more fields are provided', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await updateHardwareDetails(
      null,
      toFormData({ mouse: 'GPX', keyboard: '', mousepad: '', headset: '', monitor: '' })
    )

    expect(result).toEqual({ success: 'Hardware details updated.' })
  })
})

describe('updateCompetitiveExperience()', () => {
  it('1: returns invalid-format error when JSON parsing fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER, fromChains: [{ data: { id: 'profile-1' }, error: null }] }) as any
    )

    const result = await updateCompetitiveExperience(
      null,
      toFormData({ experiences_json: 'not-json' })
    )

    expect(result).toEqual({ error: 'Invalid experience data format.' })
  })

  it('2: returns success for valid structured experience payload', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await updateCompetitiveExperience(
      null,
      toFormData({
        experiences_json: JSON.stringify([
          {
            year: '2025',
            role: 'IGL',
            game: 'Valorant',
            team: 'GameFolio Academy',
            highlights: 'Reached playoffs',
          },
        ]),
      })
    )

    expect(result).toEqual({ success: 'Competitive experience updated.' })
  })
})

describe('uploadPlayerHighlight()', () => {
  it('1: returns error when title is too short', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)
    const fd = new FormData()
    fd.append('title', 'Hi')
    fd.append('duration_seconds', '30')
    fd.append('video', new File([new Blob(['video'])], 'clip.mp4', { type: 'video/mp4' }))

    const result = await uploadPlayerHighlight(null, fd)

    expect(result).toEqual({ error: 'Highlight title must be at least 3 characters.' })
  })

  it('2: returns error when duration is over 120 seconds', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)
    const fd = new FormData()
    fd.append('title', 'Round clutch')
    fd.append('duration_seconds', '121')
    fd.append('video', new File([new Blob(['video'])], 'clip.mp4', { type: 'video/mp4' }))

    const result = await uploadPlayerHighlight(null, fd)

    expect(result).toEqual({ error: 'Video must be shorter than 2 minutes.' })
  })

  it('3: uploads highlight and returns success when DB insert succeeds', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const fd = new FormData()
    fd.append('title', 'Round clutch')
    fd.append('duration_seconds', '45')
    fd.append('video', new File([new Blob(['video'])], 'clip.mp4', { type: 'video/mp4' }))

    const result = await uploadPlayerHighlight(null, fd)

    expect(result).toEqual({ success: 'Highlight uploaded successfully.' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
  })
})

describe('deletePlayerHighlight()', () => {
  const VALID_HIGHLIGHT_ID = '00000050-0000-4000-8000-000000000050'

  it('1: returns highlight-not-found when highlight does not belong to user profile', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await deletePlayerHighlight(
      null,
      toFormData({ highlight_id: VALID_HIGHLIGHT_ID })
    )

    expect(result).toEqual({ error: 'Highlight not found.' })
  })

  it('2: removes highlight and returns success', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          {
            data: {
              id: VALID_HIGHLIGHT_ID,
              video_url:
                'https://example.com/storage/v1/object/public/player_highlights/path/to/clip.mp4',
            },
            error: null,
          },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await deletePlayerHighlight(
      null,
      toFormData({ highlight_id: VALID_HIGHLIGHT_ID })
    )

    expect(result).toEqual({ success: 'Highlight deleted.' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
  })
})
