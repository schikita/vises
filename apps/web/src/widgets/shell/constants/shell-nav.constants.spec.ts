import { describe, expect, it } from 'vitest'
import { ADMIN_NAV, AGENT_NAV } from './shell-nav.constants'
import type { ShellNavItem } from '../types'
import { isShellNavPathForbidden } from '../utils'

const assertNavOmitsForbidden = (items: ShellNavItem[]): void => {
  for (const item of items) {
    expect(isShellNavPathForbidden(item.to)).toBe(false)
  }
}

describe('shell nav (AC-4 / FE5)', (): void => {
  it('admin nav omits payments, Proxy6, visits, BLS, owner, and client trees', (): void => {
    assertNavOmitsForbidden(ADMIN_NAV)
    expect(ADMIN_NAV.map((item) => item.to)).toEqual([
      '/admin',
      '/admin/users',
      '/admin/agents',
      '/admin/clients',
      '/admin/apps',
      '/admin/settings',
    ])
    expect(isShellNavPathForbidden('/admin/clients')).toBe(false)
    expect(isShellNavPathForbidden('/client')).toBe(true)
    expect(isShellNavPathForbidden('/owner/apps')).toBe(true)
    expect(isShellNavPathForbidden('/admin/payments')).toBe(true)
  })

  it('agent nav omits settings, users, payments, Proxy6, visits, and BLS', (): void => {
    assertNavOmitsForbidden(AGENT_NAV)
    expect(AGENT_NAV.every((item) => item.to.startsWith('/app'))).toBe(true)
    expect(AGENT_NAV.some((item) => item.to.includes('settings'))).toBe(false)
    expect(AGENT_NAV.some((item) => item.to.includes('users'))).toBe(false)
    expect(AGENT_NAV.map((item) => item.to)).toEqual([
      '/app',
      '/app/clients',
      '/app/apps',
      '/app/balance',
    ])
  })
})
