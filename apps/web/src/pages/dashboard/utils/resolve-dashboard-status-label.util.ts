import { isApplicationStatus, statusLabel } from '@/entities/application'

export const resolveDashboardStatusLabel = (value: string): string =>
  isApplicationStatus(value) ? statusLabel(value) : value
