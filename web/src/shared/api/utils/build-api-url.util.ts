import { appBase } from '@/shared/lib'

/** DEV: relative `/api…` (Vite proxy). Prod: `${appBase()}/api…` (e.g. `/vises/api…`). */
export const buildApiUrl = (path: string) => {
  const prefix = import.meta.env.DEV ? '' : appBase()
  return `${prefix}/api${path}`
}
