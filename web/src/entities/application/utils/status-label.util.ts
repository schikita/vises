import { STATUSES } from '../constants'
import type { Status } from '../types'

export const statusLabel = (id: Status) => STATUSES.find((s) => s.id === id)?.label ?? id
