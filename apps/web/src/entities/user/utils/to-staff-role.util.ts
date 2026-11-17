import type { Role } from '../types'

export const toStaffRole = (role: string): Role =>
  role === 'superadmin' || role === 'admin' || role === 'agent' ? role : 'agent'
