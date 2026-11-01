import { describe, expect, it, vi } from 'vitest'
import { createApiHttpError } from './create-api-http-error.util'
import { redirectIfEntityGone } from './redirect-if-entity-gone.util'

describe('redirectIfEntityGone (AC-19c)', (): void => {
  it('invalidates the entity query and navigates with a notice key', (): void => {
    const invalidateQueries = vi.fn()
    const navigate = vi.fn()
    const queryClient = { invalidateQueries } as never

    const handled = redirectIfEntityGone({
      error: createApiHttpError(404, 'client_not_found', {
        detail: 'client_not_found',
      }),
      queryClient,
      queryKey: ['clients'],
      navigate,
      listPath: '/app/clients',
      noticeI18nKey: 'errors.entityGone.client',
    })

    expect(handled).toBe(true)
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['clients'],
    })
    expect(navigate).toHaveBeenCalledWith('/app/clients', {
      replace: true,
      state: { noticeI18nKey: 'errors.entityGone.client' },
    })
  })

  it('returns false for non-gone errors', (): void => {
    const invalidateQueries = vi.fn()
    const navigate = vi.fn()

    const handled = redirectIfEntityGone({
      error: new Error('forbidden_role'),
      queryClient: { invalidateQueries } as never,
      queryKey: ['clients'],
      navigate,
      listPath: '/app/clients',
      noticeI18nKey: 'errors.entityGone.client',
    })

    expect(handled).toBe(false)
    expect(invalidateQueries).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
