import type { PortalRegisterUserSelectors } from '../types';

/**
 * Static RegisterUser form selectors (DEC-001 / REQ-001–005).
 *
 * Prefer stable `#id` when live `id` equals the portal field name.
 * CountryCode live id is `inputGroup-sizing-default` (not `CountryCode`);
 * fixture HTML must use the same id (DEC-003). No name= fallback.
 * CAPTCHA selectors stay in `portal-captcha-selectors.constants.ts` (REQ-006).
 * OTP Generate / Submit / Resend: portal-email-otp (REQ-005 / DEC-005).
 */
export const PORTAL_REGISTER_USER_SELECTORS: PortalRegisterUserSelectors = {
  formRoot: '#myForm',
  verifyControl: '#btnVerify',
  verifiedControl: '#btnVerified',
  generateControl: '#btnGenerate',
  submitControl: '#btnSubmit',
  regenerateControl: '#btnReGenerate',
  fields: {
    SurName: '#SurName',
    FirstName: '#FirstName',
    LastName: '#LastName',
    DateOfBirth: '#DateOfBirth',
    PassportType: '#PassportType',
    BirthCountry: '#BirthCountry',
    PassportNumber: '#PassportNumber',
    PassportIssueDate: '#PassportIssueDate',
    PassportExpiryDate: '#PassportExpiryDate',
    IssuePlace: '#IssuePlace',
    Mobile: '#Mobile',
    Email: '#Email',
    CountryCode: '#inputGroup-sizing-default',
    EmailOtp: '#EmailOtp',
  },
};
