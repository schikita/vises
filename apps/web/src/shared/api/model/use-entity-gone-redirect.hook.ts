import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { UseEntityGoneRedirectInput } from '../types/use-entity-gone-redirect-input.types'
import { redirectIfEntityGone } from '../utils/redirect-if-entity-gone.util'

/** Watch a query/mutation error and redirect on entity 404 (AC-19c). */
export const useEntityGoneRedirect = (
  input: UseEntityGoneRedirectInput,
): void => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const handledRef = useRef(false)

  useEffect((): void => {
    if (!input.enabled || input.error == null || handledRef.current) {
      return
    }

    const handled = redirectIfEntityGone({
      error: input.error,
      queryClient,
      queryKey: input.queryKey,
      navigate,
      listPath: input.listPath,
      noticeI18nKey: input.noticeI18nKey,
    })

    if (handled) {
      handledRef.current = true
    }
  }, [
    input.enabled,
    input.error,
    input.listPath,
    input.noticeI18nKey,
    input.queryKey,
    navigate,
    queryClient,
  ])
}
