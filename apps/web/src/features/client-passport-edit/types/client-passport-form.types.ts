import { CLIENT_PASSPORT_FORM_FIELDS } from '../constants'

export type ClientPassportFormField =
  (typeof CLIENT_PASSPORT_FORM_FIELDS)[number]

export type ClientPassportFormValues = Record<ClientPassportFormField, string>


export type ClientPassportEditFormProps = {
  defaultValues: ClientPassportFormValues
  apiError: string
  saved: boolean
  pending: boolean
  onValidSubmit: (values: ClientPassportFormValues) => Promise<boolean>
}
