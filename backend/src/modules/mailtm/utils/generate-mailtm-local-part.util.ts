import { randomBytes } from 'crypto';

/** Random local-part for a one-run Mail.tm address (DEC-008). */
export const generateMailTmLocalPart = (): string =>
  `vises${randomBytes(6).toString('hex')}`;
