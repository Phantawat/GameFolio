import { test, expect } from '@playwright/test'

test.describe('Admin Flow – Role-Gated Dashboard', () => {
  test('1: visiting /admin as PLAYER redirects away', async ({ page }) => {
    // TODO: Authenticate as player user
    await page.goto('/admin')
    // Should redirect to /dashboard/player or show access denied
    await expect(page).not.toHaveURL(/\/admin$/)
  })

  test('2: visiting /admin as PLATFORM_ADMIN loads dashboard', async ({ page }) => {
    // TODO: Authenticate as admin user
    test.skip()
  })

  test('3: admin views all organizations in table', async ({ page }) => {
    // TODO: Authenticate as admin, verify org table
    test.skip()
  })

  test('4: admin views all tryouts with status badges', async ({ page }) => {
    // TODO: Authenticate as admin, verify tryout table
    test.skip()
  })

  test('5: admin deactivates an active tryout', async ({ page }) => {
    // TODO: Authenticate as admin, click deactivate
    test.skip()
  })

  test('6: deactivated tryout hidden from public tryout search', async ({ page }) => {
    // TODO: After deactivation, player search doesn't show it
    test.skip()
  })

  test('7: admin re-activates the tryout', async ({ page }) => {
    // TODO: Authenticate as admin, click activate
    test.skip()
  })
})
