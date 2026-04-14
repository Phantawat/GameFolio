import { test, expect } from '@playwright/test'
import { hasCredentials, loginAs } from './fixtures/auth'

test.describe('Authentication Guards', () => {
  test('1: redirects to /login when visiting /dashboard/player while logged out', async ({ page }) => {
    await page.goto('/dashboard/player')
    await expect(page).toHaveURL(/\/login/)
  })

  test('2: redirects to /login when visiting /org/rosters while logged out', async ({ page }) => {
    await page.goto('/org/rosters')
    await expect(page).toHaveURL(/\/login/)
  })

  test('3: redirects logged-in user away from /login', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/login')
    await expect(page).toHaveURL(/\/dashboard\/player|\/dashboard/)
  })

  test('4: redirects to /org/create when logged in but no org membership', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/org/rosters')
    await expect(page).toHaveURL(/\/org\/create/)
  })

  test('5: shows error with wrong password', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/^password$/i).fill('wrongpassword')
    await page.getByRole('button', { name: /^sign in$/i }).click()
    // Expect error toast or message
    await expect(page.locator('[data-sonner-toast]').or(page.getByText(/invalid|error/i))).toBeVisible({
      timeout: 10000,
    })
  })
})
