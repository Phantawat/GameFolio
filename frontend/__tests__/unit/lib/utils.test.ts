import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn()', () => {
  it('merges two class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('ignores undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b')
  })

  it('last conflicting Tailwind class wins via tailwind-merge', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('handles falsy values gracefully', () => {
    expect(cn('a', false, null, '', 'b')).toBe('a b')
  })
})
