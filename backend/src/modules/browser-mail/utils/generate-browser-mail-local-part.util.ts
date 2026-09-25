import { randomBytes } from 'crypto';

/** Random local-part for tempmail.plus `#pre_button` (REQ-009). */
export const generateBrowserMailLocalPart = (): string =>
  `vises${randomBytes(6).toString('hex')}`;
