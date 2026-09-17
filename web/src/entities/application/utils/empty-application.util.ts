import { nowIso, uid } from '@/shared/lib'
import type { Application } from '../types'
import { emptyApplicant } from './empty-applicant.util'

export const emptyApplication = (email: string): Application => {
  return {
    id: uid('app'),
    code: `VS-${Math.floor(2400 + Math.random() * 500)}`,
    clientEmail: email,
    status: 'new',
    destination: 'Испания',
    visaType: 'Туристическая',
    category: 'Normal',
    submitCountry: 'Belarus',
    submitCity: 'Minsk',
    submitFrom: '',
    submitTo: '',
    travelDate: '',
    returnDate: '',
    paused: false,
    transfer: false,
    comment: '',
    applicants: [emptyApplicant()],
    documents: [],
    paymentAmount: 180,
    paymentPaid: false,
    paymentNote: '',
    visitDate: '',
    visitTime: '',
    visitPlace: '',
    manager: 'Мария',
    timeline: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}
