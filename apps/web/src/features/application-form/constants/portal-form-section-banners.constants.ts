/**
 * Numbered section banners matching manage_applicant(form).html (REQ-002).
 * Core (005a) + conditional / inviting / cost / EU (005b).
 */
export const PORTAL_FORM_SECTION_BANNERS = {
  personalDetails: { number: 1, title: 'Personal Details' },
  minors: {
    number: 2,
    title:
      'In the case of minors, details of parental authority/legal guardian',
  },
  passportDetails: { number: 3, title: 'Passport Details' },
  addressContact: { number: 4, title: 'Address & Contact Details' },
  otherResidence: {
    number: 5,
    title:
      'Residence in a country other than the country of current nationality',
  },
  employerDetails: {
    number: 6,
    title: 'Employer Details. For Students, details of educational establishment',
  },
  travelInformation: { number: 7, title: 'Travel Information' },
  previousSchengenVisa: { number: 8, title: 'Previous Schengen Visa Details' },
  fingerprints: {
    number: 9,
    title:
      'Fingerprints collected previously for the purpose of applying for a schengen visa',
  },
  entryPermit: {
    number: 10,
    title: 'Entry Permit for the final country of destination, where applicable',
  },
  inviting: {
    number: 11,
    title:
      'Details of the inviting person(s) in the member state(s). If not applicable, details of hotel(s) or temporary accommodation(s) in the member state(s)',
  },
  costOfTravelling: {
    number: 12,
    title:
      "Cost of travelling and living during the applicant's stay is covered",
  },
  euFamilyPersonalData: {
    number: 13,
    title:
      'Personal data of the family member who is an EU, EEA or CH citizen',
  },
  euFamilyRelationship: {
    number: 14,
    title: 'Family relationship with an EU, EEA or CH citizen',
  },
  booking: { number: 0, title: 'Booking — Location & Visa Type' },
} as const
