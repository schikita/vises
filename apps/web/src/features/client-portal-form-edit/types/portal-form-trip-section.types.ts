import type { PortalFormSectionProps } from './portal-form-section.types'

export type PortalFormTripSectionProps = PortalFormSectionProps & {
  tripDisabled: boolean
  tripDisabledMessage: string
}
