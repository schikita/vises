import { describe, expect, it } from 'vitest'
import { homePath } from './home-path.util'

describe('homePath (FR-1 / AC-2)', (): void => {
  it('sends superadmin and admin to /admin', (): void => {
    expect(homePath('superadmin')).toBe('/admin')
    expect(homePath('admin')).toBe('/admin')
  })

  it('sends agent to /app', (): void => {
    expect(homePath('agent')).toBe('/app')
  })
})
