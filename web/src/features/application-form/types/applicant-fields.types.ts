export type ApplicantFieldsSection = 'personal' | 'documents' | 'contactJourney' | 'all'

export type ApplicantFieldsProps = {
  /** RHF path prefix, e.g. `applicants.0` */
  namePrefix: string
  /** Which field groups to render; default `all` for detail edit. */
  section?: ApplicantFieldsSection
}
