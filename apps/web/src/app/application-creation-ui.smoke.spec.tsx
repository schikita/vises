import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const appSourcePath = resolve(here, './App.tsx')
const createPageSourcePath = resolve(
  here,
  '../pages/applications/ApplicationCreatePage.tsx',
)
const applicationsSourcePath = resolve(
  here,
  '../pages/applications/Applications.tsx',
)
const ctaUtilSourcePath = resolve(
  here,
  '../pages/applications/utils/resolve-applications-empty-create-cta.util.ts',
)
const ctaConstantsSourcePath = resolve(
  here,
  '../pages/applications/constants/applications-empty-create-cta.constants.ts',
)
const portalFormPageSourcePath = resolve(
  here,
  '../pages/clients/ClientPortalFormPage/ClientPortalFormPage.tsx',
)
const featureRoot = resolve(here, '../features/application-create')

/**
 * Cross-slice smoke for application-creation-ui (ACU-TASK-005).
 * Source-level glue checks across app / pages / features; runtime create →
 * detail and credentials paths live in ApplicationCreatePage.spec.tsx and
 * features/application-create unit suites (covered by the same vitest run).
 */
describe('application-creation-ui smoke (ACU-TASK-005)', (): void => {
  describe('role CTA targets (AC-ACU-009)', (): void => {
    it('keeps staff and agent empty-CTA path constants', (): void => {
      const constantsSource = readFileSync(ctaConstantsSourcePath, 'utf8')
      expect(constantsSource).toContain("'/admin/apps/new'")
      expect(constantsSource).toContain("'/app/clients'")
    })

    it('resolve util maps agent to clients and other staff roles to apps/new', (): void => {
      const utilSource = readFileSync(ctaUtilSourcePath, 'utf8')
      expect(utilSource).toContain("role === 'agent'")
      expect(utilSource).toContain('APPLICATIONS_AGENT_CLIENTS_CREATE_PATH')
      expect(utilSource).toContain('APPLICATIONS_STAFF_CREATE_PATH')
    })

    it('Applications list wires resolveApplicationsEmptyCreateCta', (): void => {
      const source = readFileSync(applicationsSourcePath, 'utf8')
      expect(source).toContain('resolveApplicationsEmptyCreateCta')
      expect(source).toContain('createCtaTo')
      expect(source).toContain('createCtaLabel')
    })
  })

  describe('admin route + agent forbidden (AC-ACU-003)', (): void => {
    const source = readFileSync(appSourcePath, 'utf8')
    const agentTree =
      source.match(/path="\/app"[\s\S]*?path="\/admin"/)?.[0] ?? ''
    const adminTree =
      source.match(/path="\/admin"[\s\S]*?<Route path="\*"/)?.[0] ?? ''

    it('registers admin apps/new before apps/:id', (): void => {
      expect(adminTree).toMatch(/path=["']apps\/new["']/)
      expect(adminTree).toContain('ApplicationCreatePage')
      const adminNewIdx = adminTree.search(/path=["']apps\/new["']/)
      const adminIdIdx = adminTree.search(/path=["']apps\/:id["']/)
      expect(adminNewIdx).toBeGreaterThan(-1)
      expect(adminIdIdx).toBeGreaterThan(adminNewIdx)
    })

    it('keeps agent tree free of apps/new', (): void => {
      expect(agentTree.length).toBeGreaterThan(0)
      expect(agentTree).not.toMatch(/path=["']apps\/new["']/)
      expect(agentTree).not.toContain('ApplicationCreatePage')
    })
  })

  describe('staff Path B wiring (AC-ACU-002, AC-ACU-004)', (): void => {
    it('ApplicationCreatePage opens the portal form after a blank create', (): void => {
      const source = readFileSync(createPageSourcePath, 'utf8')
      expect(source).toContain('ApplicationCreate')
      expect(source).toContain('/admin/clients/${clientId}/portal-form')
      expect(source).not.toMatch(/postClientCreate/)
      expect(source).not.toMatch(/navigate\(`\/admin\/apps\/\$\{id\}`\)/)
      expect(source).not.toMatch(/console\.(log|debug|info|warn|error)/)
    })

    it('application-create feature does not call POST /clients or log secrets', (): void => {
      const sliceFiles = [
        'index.ts',
        'components/ApplicationCreate/ApplicationCreate.tsx',
        'components/ApplicationCreateIssuedAccess/ApplicationCreateIssuedAccess.tsx',
        'utils/start-application-create.util.ts',
      ]

      for (const relative of sliceFiles) {
        const source = readFileSync(join(featureRoot, relative), 'utf8')
        expect(source).not.toMatch(/postClientCreate/)
        expect(source).not.toMatch(/\/clients['"`]/)
        expect(source).not.toMatch(/console\.(log|debug|info|warn|error)/)
      }
    })
  })

  describe('portal-form soft-disable policy untouched (AC-ACU-010)', (): void => {
    it('keeps tripDisabled = !applicationId on ClientPortalFormPage', (): void => {
      const source = readFileSync(portalFormPageSourcePath, 'utf8')
      expect(source).toMatch(/const tripDisabled = !applicationId/)
      expect(source).toContain("t('clients.portalForm.tripDisabled')")
    })
  })
})
