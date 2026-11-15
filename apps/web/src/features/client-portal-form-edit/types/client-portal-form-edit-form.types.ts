import type { ClientPortalFormValues } from './client-portal-form.types'

export type ClientPortalFormEditFormProps = {
  defaultValues: ClientPortalFormValues
  tripDisabled: boolean
  tripDisabledMessage: string
  passportError: string
  portalFormError: string
  tripError: string
  saved: boolean
  pending: boolean
  onValidSubmit: (values: ClientPortalFormValues) => Promise<boolean>
}
