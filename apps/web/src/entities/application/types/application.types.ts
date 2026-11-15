import type { PortalClientPortalProgress } from '@/entities/portal-autofill'

export type Status =
  | 'new'
  | 'docs'
  | 'review'
  | 'ready'
  | 'booked'
  | 'done'
  | 'fixes'
  | 'autofill_ok'
  | 'autofill_failed'
  | 'declined'

export type DocType =
  | 'selfie'
  | 'passport'
  | 'visa_photo'
  | 'insurance'
  | 'video'
  | 'other'

export type Applicant = {
  id: string
  firstName: string
  lastName: string
  lastNameAtBirth: string
  dob: string
  placeOfBirth: string
  countryOfBirth: string
  nationality: string
  gender: 'female' | 'male'
  maritalStatus: string
  passportNumber: string
  passportIssued: string
  passportExpires: string
  relationship?: string
  otherNames?: string
  nationalityAtBirth?: string
  nationalId?: string
  passportType?: string
  /** Passport Issue Country (portal BirthCountry); English portal label. */
  passportIssueCountry?: string
  passportIssuedBy?: string
  email?: string
  phone?: string
  address?: string
  purpose?: string
  firstEntry?: string
  entries?: string
  durationDays?: string
}

export type DocFile = {
  id: string
  type: DocType
  name: string
  uploadedAt: string
  /** Server filesystem name; absent/empty means open is unavailable (DEC-005). */
  stored?: string
  preview?: string
}

export type TimelineItem = {
  at: string
  text: string
  actor: string
}

export type Application = {
  id: string
  code: string
  /**
   * 1:1 Client id for staff portal-form / passport HTTP routes (PF-TASK-002b).
   * Empty string until the application is saved and AppOut returns a real id.
   */
  clientId: string
  clientEmail: string
  /** Portal RegisterUser / login email; null when unset (DEC-004). */
  portalFormEmail: string | null
  status: Status
  destination: string
  visaType: string
  /**
   * Portal Visa Sub Type; null when unset (REQ-003 / DEC-003).
   * Optional until form schemas collect it (PF-TASK-004); API AppOut always returns it.
   */
  visaSubType?: string | null
  category?: string
  submitCountry: string
  submitCity: string
  submitFrom?: string
  submitTo?: string
  travelDate: string
  returnDate: string
  paused?: boolean
  transfer?: boolean
  comment: string
  applicants: Applicant[]
  documents: DocFile[]
  paymentAmount: number
  paymentPaid: boolean
  paymentNote: string
  visitDate: string
  visitTime: string
  visitPlace: string
  manager: string
  timeline: TimelineItem[]
  createdAt: string
  updatedAt: string
  /** Client-safe portal progress when API embeds it (DEC-007); staff may omit. */
  portalProgress?: PortalClientPortalProgress
}
