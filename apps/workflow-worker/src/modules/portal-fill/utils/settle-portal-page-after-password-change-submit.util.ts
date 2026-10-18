import { PORTAL_PASSWORD_CHANGE_POST_SUBMIT_SETTLE_MS } from '../constants';
import type {
  PortalPage,
  SettlePortalPageAfterPasswordChangeSubmitResult,
} from '../types';

/**
 * Best-effort `domcontentloaded` settle after a successful Update Password click.
 * Mirrors login settle semantics; never throws — settle alone must not abort
 * the pipeline (DEC-002 / DEC-003 / REQ-002).
 */
export const settlePortalPageAfterPasswordChangeSubmit = async (
  page: PortalPage,
  options?: { timeoutMs?: number },
): Promise<SettlePortalPageAfterPasswordChangeSubmitResult> => {
  const timeoutMs =
    options?.timeoutMs ?? PORTAL_PASSWORD_CHANGE_POST_SUBMIT_SETTLE_MS;
  const waitForLoadState = page.waitForLoadState;
  if (typeof waitForLoadState !== 'function') {
    return { settled: false, via: 'unavailable' };
  }

  try {
    await waitForLoadState.call(page, 'domcontentloaded', { timeout: timeoutMs });
    return { settled: true, via: 'domcontentloaded' };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? 'settle failed');
    if (/timeout/i.test(message)) {
      return { settled: false, via: 'timeout' };
    }
    return { settled: false, via: 'error' };
  }
};
