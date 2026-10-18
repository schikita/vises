import type { PortalFillOnBrowserLaunched } from '../types/portal-fill-abort.types';

/**
 * Notify the caller that a browser was launched so it can register a
 * force-close hook (DEC-001). No-op when callback is absent.
 */
export const invokePortalFillBrowserLaunched = (input: {
  onBrowserLaunched?: PortalFillOnBrowserLaunched;
  close: () => Promise<void>;
}): void => {
  input.onBrowserLaunched?.(input.close);
};
