/**
 * Numbered Edit Member section titles from manage_applicant(form).html (§16 / REQ-FE-009).
 * Trip subsection title from select_lolcation_and_visa_type.html.
 */
export const PORTAL_FORM_SECTION_LABELS = {
  personal: '1. Personal Details',
  minor:
    '2. In the case of minors, details of parental authority/legal guardian',
  passport: '3. Passport Details',
  home: '4. Address & Contact Details',
  otherResidence:
    '5. Residence in a country other than the country of current nationality',
  employer:
    '6. Employer Details. For Students, details of educational establishment',
  travel: '7. Travel Information',
  previousVisa: '8. Previous Schengen Visa Details',
  fingerprint:
    '9. Fingerprints collected previously for the purpose of applying for a schengen visa',
  entryPermit:
    '10. Entry Permit for the final country of destination, where applicable',
  inviting:
    '11. Details of the inviting person(s) in the member state(s). If not applicable, details of hotel(s) or temporary accommodation(s) in the member state(s)',
  invitingCompany: 'Inviting Company/Organization/Hotel Details',
  invitingContact: 'Contact Person Details',
  cost: "12. Cost of travelling and living during the applicant's stay is covered",
  euFamilyCitizen:
    '13. Personal data of the family member who is an EU, EEA or CH citizen',
  euFamilyRelationship:
    '14. Family relationship with an EU, EEA or CH citizen',
  trip: 'Select Your Location & Visa Type',
} as const
