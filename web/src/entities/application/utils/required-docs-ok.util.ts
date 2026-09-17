import { DOC_TYPES } from '../constants'
import type { Application } from '../types'

export const requiredDocsOk = (app: Application) => {
  const have = new Set(app.documents.map((d) => d.type))
  return DOC_TYPES.filter((d) => d.required).every((d) => have.has(d.id))
}
