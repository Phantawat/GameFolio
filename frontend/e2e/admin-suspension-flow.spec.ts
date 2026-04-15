import { expect, test } from '@playwright/test'
import { hasCredentials, loginAs } from './fixtures/auth'

test.describe('Admin Suspension Regression', () => {
  test.describe.configure({ mode: 'serial' })

  test('admin can suspend recruiter-no-org, blocked login, then reactivate', async ({ page, browser }) => {
    test.skip(
      process.env.E2E_RUN_SUSPENSION !== 'true',
      'Set E2E_RUN_SUSPENSION=true to run suspension regression.'
    )

    test.skip(
      !hasCredentials('admin') || !hasCredentials('recruiterNoOrg'),
      'Missing E2E_ADMIN or E2E_RECRUITER_NO_ORG credentials'
    )

    const targetEmail = process.env.E2E_RECRUITER_NO_ORG_EMAIL
    const targetPassword = process.env.E2E_RECRUITER_NO_ORG_PASSWORD
    test.skip(!targetEmail || !targetPassword, 'Missing E2E_RECRUITER_NO_ORG credentials')

    await loginAs(page, 'admin')
    await page.goto('/admin')

    const targetRow = page.locator('tr').filter({ hasText: targetEmail }).first()
    await expect(targetRow).toBeVisible()

    const suspendButton = targetRow.getByRole('button', { name: /suspend/i })
    if (await suspendButton.count()) {
      await suspendButton.click()
      await expect(targetRow.getByText('Suspended', { exact: true })).toBeVisible({ timeout: 10000 })
    }

    const targetContext = await browser.newContext()
    const targetLoginPage = await targetContext.newPage()
    await targetLoginPage.goto('/login')
    await targetLoginPage.getByLabel(/email/i).fill(targetEmail)
    await targetLoginPage.getByLabel(/password/i).fill(targetPassword)
    await targetLoginPage.getByRole('button', { name: /^(sign in|log in)$/i }).click()

    await expect(targetLoginPage).toHaveURL(/\/login/)
    await expect(targetLoginPage.getByText(/your account is suspended/i)).toBeVisible({ timeout: 10000 })
    await targetContext.close()

    await page.goto('/admin')
    const refreshedTargetRow = page.locator('tr').filter({ hasText: targetEmail }).first()
    await expect(refreshedTargetRow).toBeVisible()

    const reactivateButton = refreshedTargetRow.getByRole('button', { name: /reactivate/i })
    if (await reactivateButton.count()) {
      await reactivateButton.click()
      await expect(refreshedTargetRow.getByText('Active', { exact: true })).toBeVisible({ timeout: 10000 })
    }
  })
})
