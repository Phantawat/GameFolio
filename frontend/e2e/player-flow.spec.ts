import { test, expect, type Page } from '@playwright/test'
import { hasCredentials, loginAs } from './fixtures/auth'

const PLAYER_APPLY_TRYOUT_TITLE = 'E2E Player Apply Tryout'
const DUPLICATE_TRYOUT_TITLE = 'E2E Duplicate Apply Tryout'

function getTryoutCardByTitle(page: Page, title: string) {
  const heading = page.getByRole('heading', { name: title, exact: true }).first()
  return heading.locator('xpath=ancestor::*[@role="link"][1]')
}

async function gotoTryoutsPage(page: Page) {
  await page.goto('/dashboard/tryouts', { waitUntil: 'domcontentloaded' })

  const heading = page.getByRole('heading', { name: /browse tryouts/i })
  const hasHeading = await heading.isVisible({ timeout: 8000 }).catch(() => false)

  if (!hasHeading) {
    await page.reload({ waitUntil: 'domcontentloaded' })
  }

  await expect(heading).toBeVisible({ timeout: 15000 })
}

test.describe('Player Flow – Full Journey', () => {
  // These tests require a real or seeded Supabase instance running.
  // Configure PLAYWRIGHT_BASE_URL and seed data via supabase/seed.sql.

  test('1: sign up with valid email/password redirects to /onboarding', async ({ page }) => {
    test.skip(
      process.env.E2E_ALLOW_SIGNUP !== 'true' || process.env.E2E_SIGNUP_STABLE !== 'true',
      'Set E2E_ALLOW_SIGNUP=true and E2E_SIGNUP_STABLE=true only in environments where Supabase signup rate limits are controlled.'
    )

    const email = `e2e-player-${Date.now()}@example.com`
    const password = 'TestPassword123!'

    await page.goto('/signup')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/^password$/i).fill(password)
    await page.getByLabel(/confirm password/i).fill(password)
    await page.getByRole('checkbox', { name: /i agree to the terms and conditions and privacy policy/i }).check()
    await page.getByRole('button', { name: /^sign up$/i }).click()
    // Depending on email verification flow, may redirect or show confirmation
    await expect(page.getByText(/check your email|onboarding/i)).toBeVisible({ timeout: 15000 })
  })

  test('2: submit gamertag + region on onboarding redirects to dashboard', async ({ page }) => {
    test.skip(!hasCredentials('onboardingPlayer'), 'Missing E2E_ONBOARDING_PLAYER credentials')
    await loginAs(page, 'onboardingPlayer')

    if (/\/onboarding(?:\?.*)?$/.test(page.url())) {
      await page.getByLabel(/gamertag/i).fill(`E2E-Onboard-${Date.now()}`)
      await page.getByLabel(/region/i).fill('NA')
      await page.getByRole('button', { name: /complete setup/i }).click()
    }

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

    await gotoTryoutsPage(page)
    await expect(page.getByText(PLAYER_APPLY_TRYOUT_TITLE)).toBeVisible()
  })

  test('5: apply to a tryout shows success toast', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await gotoTryoutsPage(page)
    const applyNowButtons = page.getByRole('button', { name: /^apply now$/i })
    if ((await applyNowButtons.count()) === 0) {
      test.skip(true, 'No unapplied tryouts are available for this player fixture in the current seed state.')
    }

    const applyNowButton = applyNowButtons.first()
    const card = applyNowButton.locator('xpath=ancestor::*[@role="link"][1]')
    await expect(card).toBeVisible()

    await applyNowButton.click()
    await page.getByRole('button', { name: /submit application/i }).click()

    await expect(page.getByText(/application submitted successfully/i)).toBeVisible()
  })

  test('6: /dashboard/applications shows applied tryout with PENDING status', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/applications')
    const appliedCard = page
      .locator('div')
      .filter({ hasText: PLAYER_APPLY_TRYOUT_TITLE })
      .filter({ hasText: /under review/i })
      .first()
    await expect(appliedCard).toBeVisible()
  })

  test('7: applying to same tryout again shows already applied error', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await gotoTryoutsPage(page)
    const duplicateCard = getTryoutCardByTitle(page, DUPLICATE_TRYOUT_TITLE)
    await expect(duplicateCard).toBeVisible()
    await expect(duplicateCard.getByRole('button', { name: /^applied$/i })).toBeDisabled()
  })
})
