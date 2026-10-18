/** Portal RegisterUser field names (fill targets for v1). */
export type PortalFieldName =
  | 'SurName'
  | 'FirstName'
  | 'LastName'
  | 'DateOfBirth'
  | 'PassportType'
  | 'BirthCountry'
  | 'PassportNumber'
  | 'PassportIssueDate'
  | 'PassportExpiryDate'
  | 'IssuePlace'
  | 'Mobile'
  | 'Email'
  | 'CountryCode'
  | 'EmailOtp';

export type FieldStatus = 'filled' | 'skipped' | 'failed';

export interface FieldResult {
  field: PortalFieldName;
  status: FieldStatus;
  /** Value intended for the portal (may be masked later in report). */
  value?: string;
  reason?: string;
  /** Provisional SurName/LastName mapping (DEC-004 / OQ-4). */
  provisional?: boolean;
}
