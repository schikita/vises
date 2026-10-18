export const getNestedFormError = (errors: unknown, path: string): string | undefined => {
  const parts = path.split('.')
  let cur: unknown = errors
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  if (cur && typeof cur === 'object' && 'message' in cur) {
    const message = (cur as { message?: unknown }).message
    return typeof message === 'string' ? message : undefined
  }
  return undefined
}
