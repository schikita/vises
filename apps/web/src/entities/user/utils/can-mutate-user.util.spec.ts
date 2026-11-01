import { describe, expect, it } from 'vitest'
import { canMutateUser } from './can-mutate-user.util'

describe('canMutateUser', (): void => {
  it('allows superadmin to mutate any staff role', (): void => {
    expect(canMutateUser({ actorRole: 'superadmin', targetRole: 'superadmin' })).toBe(
      true,
    )
    expect(canMutateUser({ actorRole: 'superadmin', targetRole: 'admin' })).toBe(true)
    expect(canMutateUser({ actorRole: 'superadmin', targetRole: 'agent' })).toBe(true)
  })

  it('allows admin to mutate agents only', (): void => {
    expect(canMutateUser({ actorRole: 'admin', targetRole: 'agent' })).toBe(true)
    expect(canMutateUser({ actorRole: 'admin', targetRole: 'admin' })).toBe(false)
    expect(canMutateUser({ actorRole: 'admin', targetRole: 'superadmin' })).toBe(false)
  })

  it('denies agents', (): void => {
    expect(canMutateUser({ actorRole: 'agent', targetRole: 'agent' })).toBe(false)
  })
})
