import { expect, type Page } from '@playwright/test'

export type E2ERole = 'admin' | 'player' | 'recruiter' | 'recruiterNoOrg' | 'onboardingPlayer'

type Credentials = {
  email: string
  password: string
}

function fromEnv(emailKey: string, passwordKey: string): Credentials | null {
  const email = process.env[emailKey]
  const password = process.env[passwordKey]
  if (!email || !password) return null
  return { email, password }
}

const ROLE_CREDENTIALS: Record<E2ERole, Credentials | null> = {
  admin: fromEnv('E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD'),
  player: fromEnv('E2E_PLAYER_EMAIL', 'E2E_PLAYER_PASSWORD'),
  recruiter: fromEnv('E2E_RECRUITER_EMAIL', 'E2E_RECRUITER_PASSWORD'),
  recruiterNoOrg: fromEnv('E2E_RECRUITER_NO_ORG_EMAIL', 'E2E_RECRUITER_NO_ORG_PASSWORD'),
  onboardingPlayer: fromEnv('E2E_ONBOARDING_PLAYER_EMAIL', 'E2E_ONBOARDING_PLAYER_PASSWORD'),
}

const roleActivationChecked = new Set<E2ERole>()

export function hasCredentials(role: E2ERole): boolean {
  return Boolean(ROLE_CREDENTIALS[role])
}

async function submitLogin(page: Page, credentials: Credentials): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(credentials.email)
  await page.getByLabel(/password/i).fill(credentials.password)
  await page.getByRole('button', { name: /^(sign in|log in)$/i }).click()
}

async function ensureRoleActiveWithAdmin(page: Page, role: E2ERole): Promise<void> {
  if (role === 'admin') return
  if (roleActivationChecked.has(role)) return

  const targetCredentials = ROLE_CREDENTIALS[role]
  const adminCredentials = ROLE_CREDENTIALS.admin
  const browser = page.context().browser()

  if (!targetCredentials || !adminCredentials || !browser) {
    return
  }

  const adminContext = await browser.newContext()

  try {
    const adminPage = await adminContext.newPage()
    await submitLogin(adminPage, adminCredentials)
    await expect(adminPage).not.toHaveURL(/\/login(?:\?.*)?$/)

    await adminPage.goto('/admin')

    const targetRow = adminPage.locator('tr').filter({ hasText: targetCredentials.email }).first()
    await expect(targetRow).toBeVisible({ timeout: 10000 })

    const reactivateButton = targetRow.getByRole('button', { name: /reactivate/i }).first()
    if (await reactivateButton.count()) {
      await reactivateButton.click()
      await expect(targetRow.getByText('Active', { exact: true })).toBeVisible({ timeout: 10000 })
    }

    roleActivationChecked.add(role)
  } finally {
    await adminContext.close()
  }
}

export async function loginAs(page: Page, role: E2ERole): Promise<void> {
  const credentials = ROLE_CREDENTIALS[role]
  if (!credentials) {
    throw new Error(`Missing credentials for role: ${role}`)
  }

  await ensureRoleActiveWithAdmin(page, role)
  await submitLogin(page, credentials)

  await expect(page).not.toHaveURL(/\/login(?:\?.*)?$/)
}

export async function ensureDialogAccepted(page: Page): Promise<void> {
  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
}
