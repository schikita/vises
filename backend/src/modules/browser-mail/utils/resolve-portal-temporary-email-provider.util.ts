import {
  PORTAL_EMAIL_PROVIDER,
  type PortalEmailProviderValue,
} from '../constants';
import type { TemporaryEmailProvider } from '../../mailtm';

/**
 * Select the TemporaryEmailProvider implementation for Nest DI (DEC-011).
 * `mailtm` → API adapter; `tempmail_plus` → BrowserMailAdapter (Part B).
 */
export const resolvePortalTemporaryEmailProvider = (input: {
  emailProvider: PortalEmailProviderValue;
  apiMailAdapter: TemporaryEmailProvider;
  browserMailAdapter: TemporaryEmailProvider;
}): TemporaryEmailProvider => {
  if (input.emailProvider === PORTAL_EMAIL_PROVIDER.TEMPMAIL_PLUS) {
    return input.browserMailAdapter;
  }
  return input.apiMailAdapter;
};
