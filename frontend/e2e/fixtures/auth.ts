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

export function hasCredentials(role: E2ERole): boolean {
  return Boolean(ROLE_CREDENTIALS[role])
}

export async function loginAs(page: Page, role: E2ERole): Promise<void> {
  const credentials = ROLE_CREDENTIALS[role]
  if (!credentials) {
    throw new Error(`Missing credentials for role: ${role}`)
  }

  await page.goto('/login')
  await page.getByLabel(/email/i).fill(credentials.email)
  await page.getByLabel(/password/i).fill(credentials.password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()

  await expect(page).not.toHaveURL(/\/login$/)
}

export async function ensureDialogAccepted(page: Page): Promise<void> {
  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
}
