import { randomBytes } from 'crypto';

/** Random password for a one-run Mail.tm account (DEC-008). Never log. */
export const generateMailTmPassword = (): string =>
  randomBytes(18).toString('base64url');
