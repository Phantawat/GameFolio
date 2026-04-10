import { test, expect } from '@playwright/test'
import { ensureDialogAccepted, hasCredentials, loginAs } from './fixtures/auth'

const ADMIN_TOGGLE_TRYOUT_TITLE = 'E2E Admin Toggle Tryout'

test.describe('Admin Flow – Role-Gated Dashboard', () => {
  test.describe.configure({ mode: 'serial' })

  test('1: visiting /admin as PLAYER redirects away', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/dashboard\/player/)
  })

  test('2: visiting /admin as PLATFORM_ADMIN loads dashboard', async ({ page }) => {
    test.skip(!hasCredentials('admin'), 'Missing E2E_ADMIN credentials')
    await loginAs(page, 'admin')
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByText('Admin Dashboard')).toBeVisible()
  })

  test('3: admin views all organizations in table', async ({ page }) => {
    test.skip(!hasCredentials('admin'), 'Missing E2E_ADMIN credentials')
    await loginAs(page, 'admin')
    await page.goto('/admin')

    await page.getByRole('button', { name: /organizations/i }).click()
    await expect(page.getByRole('columnheader', { name: /organization/i })).toBeVisible()
  })

  test('4: admin views all tryouts with status badges', async ({ page }) => {
    test.skip(!hasCredentials('admin'), 'Missing E2E_ADMIN credentials')
    await loginAs(page, 'admin')
    await page.goto('/admin')

    await page.getByRole('button', { name: /tryouts/i }).click()
    await expect(page.getByRole('columnheader', { name: /tryout/i })).toBeVisible()
    await expect(page.getByText(ADMIN_TOGGLE_TRYOUT_TITLE)).toBeVisible()
  })

  test('5: admin deactivates an active tryout', async ({ page }) => {
    test.skip(!hasCredentials('admin'), 'Missing E2E_ADMIN credentials')
    await loginAs(page, 'admin')
    await page.goto('/admin')
    await page.getByRole('button', { name: /tryouts/i }).click()

    const row = page.locator('tr').filter({ hasText: ADMIN_TOGGLE_TRYOUT_TITLE }).first()
    await expect(row).toBeVisible()

    await ensureDialogAccepted(page)
    const deactivateBtn = row.getByRole('button', { name: /deactivate/i })
    if (await deactivateBtn.count()) {
      await deactivateBtn.click()
      await expect(page.getByText(/deactivated/i)).toBeVisible()
    }

    await expect(row.getByRole('button', { name: /activate/i })).toBeVisible()
  })

  test('6: deactivated tryout hidden from public tryout search', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')
    await page.goto('/dashboard/tryouts')

    await expect(page.getByText(ADMIN_TOGGLE_TRYOUT_TITLE)).not.toBeVisible()
  })

  test('7: admin re-activates the tryout', async ({ page }) => {
    test.skip(!hasCredentials('admin'), 'Missing E2E_ADMIN credentials')
    await loginAs(page, 'admin')
    await page.goto('/admin')
    await page.getByRole('button', { name: /tryouts/i }).click()

    const row = page.locator('tr').filter({ hasText: ADMIN_TOGGLE_TRYOUT_TITLE }).first()
    await expect(row).toBeVisible()

    const activateBtn = row.getByRole('button', { name: /activate/i })
    if (await activateBtn.count()) {
      await activateBtn.click()
      await expect(page.getByText(/activated/i)).toBeVisible()
    }

    await expect(row.getByRole('button', { name: /deactivate/i })).toBeVisible()
  })
})
