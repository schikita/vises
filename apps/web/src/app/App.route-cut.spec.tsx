import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appSourcePath = resolve(dirname(fileURLToPath(import.meta.url)), './App.tsx')

/** AC-1 / AC-14 / REQ-ACU-015: partial FE5 reopen — admin apps/new only. */
describe('App route cut (FE5)', (): void => {
  const source = readFileSync(appSourcePath, 'utf8')

  const agentTree = source.match(/path="\/app"[\s\S]*?path="\/admin"/)?.[0] ?? ''
  const adminTree =
    source.match(/path="\/admin"[\s\S]*?<Route path="\*"/)?.[0] ?? ''

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
    expect(source).not.toContain('BlsWorkflowPanel')
    expect(source).not.toContain('Proxy6')
  })

  it('allows admin staff create wiring and forbids agent apps/new (AC-ACU-003)', (): void => {
    expect(source).toContain('ApplicationCreatePage')
    expect(adminTree).toMatch(/path=["']apps\/new["']/)
    expect(adminTree).toContain('ApplicationCreatePage')

    const adminNewIdx = adminTree.search(/path=["']apps\/new["']/)
    const adminIdIdx = adminTree.search(/path=["']apps\/:id["']/)
    expect(adminNewIdx).toBeGreaterThan(-1)
    expect(adminIdIdx).toBeGreaterThan(adminNewIdx)

    expect(agentTree.length).toBeGreaterThan(0)
    expect(agentTree).not.toMatch(/path=["']apps\/new["']/)
    expect(agentTree).not.toContain('ApplicationCreatePage')
  })
})
