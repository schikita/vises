export type ApplicantFormValues = {
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
  passportIssuedBy?: string
  email?: string
  phone?: string
  address?: string
  purpose?: string
  firstEntry?: string
  entries?: string
  durationDays?: string
}

export type ClientTripFormValues = {
  destination: string
  visaType: string
  submitCountry: string
  submitCity: string
  travelDate: string
  returnDate: string
  comment: string
}

export type StaffTripFormValues = {
  category: string
  submitCountry: string
  submitCity: string
  submitFrom: string
  submitTo: string
  travelDate: string
  paused: boolean
  transfer: boolean
  comment: string
}
