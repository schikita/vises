/** Known legacy CRM / FR-7 status literals from §4.D. */
export type LegacyApplicationStatus =
  | 'new'
  | 'drafting'
  | 'docs'
  | 'review'
  | 'fixes'
  | 'pending'
  | 'autofill_ok'
  | 'autofill_failed'
  | 'ready'
  | 'booked'
  | 'done'
  | 'issued'
  | 'declined'
  | 'rejected';
