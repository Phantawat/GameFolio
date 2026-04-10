import { test, expect } from '@playwright/test'
import { hasCredentials, loginAs } from './fixtures/auth'

test.describe('Recruiter Flow – Full Journey', () => {
  test.describe.configure({ mode: 'serial' })

  let createdTryoutTitle = `E2E Recruiter Publish ${Date.now()}`

  test('1: navigate to /org/create shows org creation form', async ({ page }) => {
    test.skip(!hasCredentials('recruiterNoOrg'), 'Missing E2E_RECRUITER_NO_ORG credentials')
    await loginAs(page, 'recruiterNoOrg')

    await page.goto('/org/create')
    await expect(page.getByText(/create your organization/i)).toBeVisible()
  })

  test('2: submit org form redirects to /org/rosters with empty state', async ({ page }) => {
    test.skip(!hasCredentials('recruiterNoOrg'), 'Missing E2E_RECRUITER_NO_ORG credentials')
    await loginAs(page, 'recruiterNoOrg')

    await page.goto('/org/create')
    const orgName = `E2E Org ${Date.now()}`
    await page.getByLabel(/organization name/i).fill(orgName)
    await page.getByRole('button', { name: /create organization profile/i }).click()

    await expect(page).toHaveURL(/\/org\/rosters/)
    await expect(page.getByText(/no rosters yet/i)).toBeVisible()
  })

  test('3: create new roster – roster card appears', async ({ page }) => {
    test.skip(!hasCredentials('recruiter'), 'Missing E2E_RECRUITER credentials')
    await loginAs(page, 'recruiter')

    await page.goto('/org/rosters')
    await page.getByRole('button', { name: /new roster/i }).click()
    await page.locator('select[name="game_id"]').selectOption({ index: 1 })
    const rosterName = `E2E Roster ${Date.now()}`
    await page.getByLabel(/roster name/i).fill(rosterName)
    await page.getByRole('button', { name: /create roster/i }).click()

    await expect(page.getByText(rosterName)).toBeVisible()
  })

  test('4: manage tryouts on a roster – new tryout page opens', async ({ page }) => {
    test.skip(!hasCredentials('recruiter'), 'Missing E2E_RECRUITER credentials')
    await loginAs(page, 'recruiter')

    await page.goto('/org/rosters')
    await page.getByRole('link', { name: /manage tryouts/i }).first().click()
    await expect(page).toHaveURL(/\/org\/tryouts\/new/)
    await expect(page.getByText(/create new tryout listing/i)).toBeVisible()
  })

  test('5: fill tryout form and publish redirects to /org/applications', async ({ page }) => {
    test.skip(!hasCredentials('recruiter'), 'Missing E2E_RECRUITER credentials')
    await loginAs(page, 'recruiter')

    await page.goto('/org/tryouts/new')
    await page.locator('select[name="game_id"]').selectOption({ index: 1 })
    await page.getByLabel(/tryout title/i).fill(createdTryoutTitle)
    await page.getByLabel(/minimum rank requirement/i).fill('Immortal')
    await page.locator('textarea').fill('E2E published tryout description for recruiter flow validation.')
    await page.getByRole('button', { name: /publish tryout/i }).click()

    await expect(page).toHaveURL(/\/org\/applications/)
  })

  test('6: published tryout visible on /dashboard/tryouts as different player', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/tryouts')
    await expect(page.getByText(createdTryoutTitle)).toBeVisible()
  })

  test('7: player applies to tryout – appears in recruiter applications', async ({ page, browser }) => {
    test.skip(!hasCredentials('player') || !hasCredentials('recruiter'), 'Missing E2E_PLAYER or E2E_RECRUITER credentials')

    await loginAs(page, 'player')
    await page.goto('/dashboard/tryouts')
    const card = page.locator('div').filter({ hasText: createdTryoutTitle }).first()
    await expect(card).toBeVisible()
    await card.getByRole('button', { name: /apply now/i }).click()
    await page.getByRole('button', { name: /submit application/i }).click()
    await expect(page.getByText(/application submitted successfully/i)).toBeVisible()

    const recruiterContext = await browser.newContext()
    const recruiterPage = await recruiterContext.newPage()
    await loginAs(recruiterPage, 'recruiter')
    await recruiterPage.goto('/org/applications')
    await expect(recruiterPage.getByText(createdTryoutTitle)).toBeVisible()
    await recruiterContext.close()
  })

  test('8: recruiter accepts application – status updates', async ({ page }) => {
    test.skip(!hasCredentials('recruiter'), 'Missing E2E_RECRUITER credentials')
    await loginAs(page, 'recruiter')

    await page.goto('/org/applications')
    const row = page.locator('tr').filter({ hasText: createdTryoutTitle }).first()
    await expect(row).toBeVisible()
    await row.getByTitle('Accept').click()

    await expect(row.getByText(/accepted/i)).toBeVisible()
  })

  test('9: player sees accepted status on /dashboard/applications', async ({ page }) => {
    test.skip(!hasCredentials('player'), 'Missing E2E_PLAYER credentials')
    await loginAs(page, 'player')

    await page.goto('/dashboard/applications')
    await expect(page.getByText(createdTryoutTitle)).toBeVisible()
    await expect(page.getByText(/accepted/i)).toBeVisible()
  })
})
