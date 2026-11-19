import { describe, expect, it } from 'vitest'
import { shouldShowPortalFormClientLink } from './should-show-portal-form-client-link.util'

describe('shouldShowPortalFormClientLink', (): void => {
  it('hides the link while a new application is still an unnamed draft', (): void => {
    expect(shouldShowPortalFormClientLink('app-1', 'draft', false)).toBe(false)
  })

  it('hides the link when there is no application', (): void => {
    expect(shouldShowPortalFormClientLink('', 'filling', true)).toBe(false)
    expect(shouldShowPortalFormClientLink('   ', 'draft', true)).toBe(false)
  })

  it('shows the link once the client has a saved name', (): void => {
    expect(shouldShowPortalFormClientLink('app-1', 'draft', true)).toBe(true)
  })

  it('shows the link once the application has left draft', (): void => {
    expect(shouldShowPortalFormClientLink('app-1', 'filling', false)).toBe(true)
  })
})
