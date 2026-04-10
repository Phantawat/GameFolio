import { test, expect } from '@playwright/test'
import { hasCredentials, loginAs } from './fixtures/auth'

const PLAYER_APPLY_TRYOUT_TITLE = 'E2E Player Apply Tryout'
const DUPLICATE_TRYOUT_TITLE = 'E2E Duplicate Apply Tryout'

test.describe('Player Flow – Full Journey', () => {
  // These tests require a real or seeded Supabase instance running.
  // Configure PLAYWRIGHT_BASE_URL and seed data via supabase/seed.sql.

  test('1: sign up with valid email/password redirects to /onboarding', async ({ page }) => {
    const email = `e2e-player-${Date.now()}@test.com`
    await page.goto('/signup')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /sign up|create account/i }).click()
    // Depending on email verification flow, may redirect or show confirmation
    await expect(page.getByText(/check your email|onboarding/i)).toBeVisible({ timeout: 15000 })
  })

  test('2: submit gamertag + region on onboarding redirects to dashboard', async ({ page }) => {
    test.skip(!hasCredentials('onboardingPlayer'), 'Missing E2E_ONBOARDING_PLAYER credentials')
    await loginAs(page, 'onboardingPlayer')

    await expect(page).toHaveURL(/\/onboarding/)
    await page.getByLabel(/gamertag/i).fill(`E2E-Onboard-${Date.now()}`)
    await page.getByLabel(/region/i).fill('NA')
    await page.getByRole('button', { name: /complete setup/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/player/)
  })

  test('3: edit stats – pick a game + rank, save updates profile', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/player/edit-stats')
    await expect(page.getByText(/edit game stats/i)).toBeVisible()

    const gameSelect = page.locator('select[name="game_id"]')
    await gameSelect.selectOption({ index: 1 })

    const roleSelect = page.locator('select[name="main_role_id"]')
    if (await roleSelect.count()) {
      await roleSelect.selectOption({ index: 1 })
    }

    await page.getByLabel(/current rank/i).fill('Immortal 3')
    await page.getByLabel(/mmr/i).fill('2450')
    await page.getByLabel(/win rate/i).fill('62')
    await page.getByLabel(/hours played/i).fill('1200')
    await page.getByRole('button', { name: /save stats/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/player/)
  })

  test('4: /dashboard/tryouts shows active tryout cards', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/tryouts')
    await expect(page.getByText(/browse tryouts/i)).toBeVisible()
    await expect(page.getByText(PLAYER_APPLY_TRYOUT_TITLE)).toBeVisible()
  })

  test('5: apply to a tryout shows success toast', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/tryouts')
    const card = page.locator('div').filter({ hasText: PLAYER_APPLY_TRYOUT_TITLE }).first()
    await expect(card).toBeVisible()

    await card.getByRole('button', { name: /apply now/i }).click()
    await page.getByRole('button', { name: /submit application/i }).click()

    await expect(page.getByText(/application submitted successfully/i)).toBeVisible()
  })

  test('6: /dashboard/applications shows applied tryout with PENDING status', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/applications')
    await expect(page.getByText(PLAYER_APPLY_TRYOUT_TITLE)).toBeVisible()
    await expect(page.getByText(/under review/i)).toBeVisible()
  })

  test('7: applying to same tryout again shows already applied error', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/tryouts')
    const duplicateCard = page.locator('div').filter({ hasText: DUPLICATE_TRYOUT_TITLE }).first()
    await expect(duplicateCard).toBeVisible()
    await expect(duplicateCard.getByRole('button', { name: /applied/i })).toBeDisabled()
  })
})
