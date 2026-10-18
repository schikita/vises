import { PORTAL_LOGIN_POST_VERIFY_SETTLE_MS } from '../constants';
import type {
  PortalPage,
  SettlePortalPageAfterLoginVerifyResult,
} from '../types';

/**
 * Best-effort `domcontentloaded` settle after a navigating login Verify click.
 * Never throws — settle alone must not abort the pipeline (DEC-001 secondary).
 */
export const settlePortalPageAfterLoginVerify = async (
  page: PortalPage,
  options?: { timeoutMs?: number },
): Promise<SettlePortalPageAfterLoginVerifyResult> => {
  const timeoutMs = options?.timeoutMs ?? PORTAL_LOGIN_POST_VERIFY_SETTLE_MS;
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
