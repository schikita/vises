import { appBase } from './app-base.util'

export const publicUrl = (path: string) => {
  const base = appBase()
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${window.location.origin}${base}${clean}`
}
