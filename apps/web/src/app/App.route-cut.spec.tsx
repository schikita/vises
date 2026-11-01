import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appSourcePath = resolve(dirname(fileURLToPath(import.meta.url)), './App.tsx')

/** AC-1 / AC-14 route cut: App.tsx must not mount legacy trees. */
describe('App route cut (FE5)', (): void => {
  const source = readFileSync(appSourcePath, 'utf8')

  it('keeps /admin and /app RoleGuard shells and drops client/owner/invite/payments/visits', (): void => {
    expect(source).toContain('path="/admin"')
    expect(source).toContain('path="/app"')
    expect(source).toContain("roles={['superadmin', 'admin']}")
    expect(source).toContain("roles={['agent']}")
    expect(source).toContain('kind="admin"')
    expect(source).toContain('kind="agent"')

    expect(source).not.toMatch(/path=["']\/client/)
    expect(source).not.toMatch(/path=["']\/owner/)
    expect(source).not.toMatch(/path=["']\/invite/)
    expect(source).not.toMatch(/path=["']visits["']/)
    expect(source).not.toMatch(/path=["']payments["']/)
    expect(source).not.toContain('InvitePage')
    expect(source).not.toContain('ClientHome')
    expect(source).not.toContain('OwnerHome')
    expect(source).not.toContain('Payments')
    expect(source).not.toContain('Visits')
    expect(source).not.toContain('StaffCreateApplication')
    expect(source).not.toMatch(/path=["']apps\/new["']/)
    expect(source).not.toContain('BlsWorkflowPanel')
    expect(source).not.toContain('Proxy6')
  })
})
