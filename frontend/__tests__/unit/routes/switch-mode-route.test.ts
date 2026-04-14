import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { GET as switchModeRoute } from '@/app/(dashboard)/dashboard/switch-mode/route'

describe('GET /dashboard/switch-mode', () => {
  it('redirects invalid mode to /dashboard', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard/switch-mode?mode=bad')
    const res = await switchModeRoute(req)

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/dashboard')
  })

  it('uses default player path when next is unsafe and sets nav cookie', async () => {
    const req = new NextRequest(
      'http://localhost:3000/dashboard/switch-mode?mode=player&next=//evil.example'
    )
    const res = await switchModeRoute(req)

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/dashboard/player')
    expect(res.headers.get('set-cookie')).toContain('gf_nav_mode=player')
  })

  it('accepts safe relative next path for org mode', async () => {
    const req = new NextRequest(
      'http://localhost:3000/dashboard/switch-mode?mode=org&next=/org/tryouts'
    )
    const res = await switchModeRoute(req)

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/org/tryouts')
    expect(res.headers.get('set-cookie')).toContain('gf_nav_mode=org')
  })
})
