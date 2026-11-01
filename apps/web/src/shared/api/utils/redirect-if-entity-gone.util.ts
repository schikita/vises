import type { RedirectIfEntityGoneInput } from '../types/redirect-if-entity-gone-input.types'
import { isEntityGoneError } from './is-entity-gone-error.util'

/**
 * On entity 404: invalidate that entity’s queries and navigate to the list
 * with a localized notice key (AC-19c). Returns true when handled.
 */
export const redirectIfEntityGone = (
  input: RedirectIfEntityGoneInput,
): boolean => {
  if (!isEntityGoneError(input.error)) {
    return false
  }

  void input.queryClient.invalidateQueries({ queryKey: input.queryKey })
  input.navigate(input.listPath, {
    replace: true,
    state: { noticeI18nKey: input.noticeI18nKey },
  })
  return true
}
