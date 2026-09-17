import type { FieldResult } from './portal-field.types';
import type { MappingResult } from './portal-mapping.types';
import type { PortalPage } from './patchright-surface.types';

export type RunPortalFillPipelineOptions = {
  page: PortalPage;
  mapping: MappingResult;
  screenshotPath?: string;
  /** Non-empty key enables CapMonster Verify + BLS solve (DEC-003 / DEC-004). */
  capMonsterApiKey?: string;
  /**
   * MailSlurp key + inbox id together arm post-CapMonster OTP UI (DEC-001 / DEC-008).
   */
  mailSlurpApiKey?: string;
  mailSlurpInboxId?: string;
};

export type RunPortalFillPipelineResult = {
  /** False on CAPTCHA/login/#myForm hard failures (maps to navigationOk: false). */
  ok: boolean;
  error?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  screenshotPath?: string;
  usedStandIn?: boolean;
  verifyClicked: boolean;
  /** True after intentional `#EmailOtp` fill (DEC-009). */
  emailOtpTouched: boolean;
  capMonsterAttempted?: boolean;
  capMonsterOk?: boolean;
  mailSlurpOtpAttempted?: boolean;
  mailSlurpOtpOk?: boolean;
};
