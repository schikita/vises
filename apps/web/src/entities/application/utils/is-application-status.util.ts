import { APPLICATION_STATUSES } from '@vises/contracts'
import type { Status } from '../types'

export const isApplicationStatus = (value: string): value is Status =>
  (APPLICATION_STATUSES as readonly string[]).includes(value)
