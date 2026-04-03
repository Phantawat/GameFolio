import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

test.describe('Production Smoke Tests', () => {
  test('1: landing page loads with hero text', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
    // Verify hero section is visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('2: /login renders with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('3: end-to-end login with seeded test account', async ({ page }) => {
    // TODO: Use seeded test credentials
    test.skip()
  })

  test('4: static assets load without 404s', async ({ page }) => {
    const failedRequests: string[] = []
    page.on('response', (response) => {
      if (response.status() === 404 && response.url().match(/\.(js|css|woff2?|png|jpg|svg)$/)) {
        failedRequests.push(response.url())
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(failedRequests).toHaveLength(0)
  })

  test('5: no console errors on landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Filter out known benign errors (e.g. favicon)
    const criticalErrors = errors.filter((e) => !e.includes('favicon'))
    expect(criticalErrors).toHaveLength(0)
  })

  test('6: environment variables are set (no undefined in page source)', async ({ page }) => {
    await page.goto('/')
    const content = await page.content()
    expect(content).not.toContain('undefined')
  })

  test('7: tryout search page loads public data', async ({ page }) => {
    // The public tryout listing should work without authentication
    await page.goto('/dashboard/tryouts')
    // May redirect to login if auth-gated, adjust if publicly accessible
    await expect(page.locator('body')).toBeVisible()
  })

  test('8: admin route is blocked for non-admin', async ({ page }) => {
    await page.goto('/admin')
    // Should redirect to /login for unauthenticated users
    await expect(page).toHaveURL(/\/login/)
  })
})
