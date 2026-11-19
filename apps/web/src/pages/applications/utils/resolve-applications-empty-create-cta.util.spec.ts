import { describe, expect, it } from 'vitest'
import {
  APPLICATIONS_AGENT_CLIENTS_CREATE_PATH,
  APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY,
  APPLICATIONS_STAFF_CREATE_PATH,
} from '../constants/applications-empty-create-cta.constants'
import { resolveApplicationsEmptyCreateCta } from './resolve-applications-empty-create-cta.util'

describe('resolveApplicationsEmptyCreateCta (ACU-TASK-001 / AC-ACU-009)', (): void => {
  it('maps admin to /admin/apps/new', (): void => {
    expect(resolveApplicationsEmptyCreateCta('admin')).toEqual({
      to: APPLICATIONS_STAFF_CREATE_PATH,
      labelKey: APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY.staff,
    })
    expect(resolveApplicationsEmptyCreateCta('admin').to).toBe(
      '/admin/apps/new',
    )
  })

  it('maps superadmin to /admin/apps/new', (): void => {
    expect(resolveApplicationsEmptyCreateCta('superadmin')).toEqual({
      to: APPLICATIONS_STAFF_CREATE_PATH,
      labelKey: APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY.staff,
    })
    expect(resolveApplicationsEmptyCreateCta('superadmin').to).toBe(
      '/admin/apps/new',
    )
  })

  it('maps agent to /app/clients (existing Clients create entry)', (): void => {
    expect(resolveApplicationsEmptyCreateCta('agent')).toEqual({
      to: APPLICATIONS_AGENT_CLIENTS_CREATE_PATH,
      labelKey: APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY.agent,
    })
    expect(resolveApplicationsEmptyCreateCta('agent').to).toBe('/app/clients')
    expect(resolveApplicationsEmptyCreateCta('agent').to).not.toContain(
      '/apps/new',
    )
  })
})
