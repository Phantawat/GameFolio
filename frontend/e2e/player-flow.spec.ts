import { test, expect } from '@playwright/test'

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
    // TODO: Authenticate as user without profile
    test.skip()
  })

  test('3: edit stats – pick a game + rank, save updates profile', async ({ page }) => {
    // TODO: Authenticate as onboarded player
    test.skip()
  })

  test('4: /dashboard/tryouts shows active tryout cards', async ({ page }) => {
    // TODO: Authenticate as onboarded player, seed active tryouts
    test.skip()
  })

  test('5: apply to a tryout shows success toast', async ({ page }) => {
    // TODO: Authenticate and navigate to tryouts
    test.skip()
  })

  test('6: /dashboard/applications shows applied tryout with PENDING status', async ({ page }) => {
    // TODO: Authenticate after applying
    test.skip()
  })

  test('7: applying to same tryout again shows already applied error', async ({ page }) => {
    // TODO: Authenticate and try duplicate apply
    test.skip()
  })
})
