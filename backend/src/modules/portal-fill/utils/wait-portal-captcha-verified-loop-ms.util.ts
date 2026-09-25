/**
 * Abort-aware delay for Verified-loop progressive unsolvable backoff (DEC-012).
 * Settles early when optional `AbortSignal` aborts; uninterrupted when omitted.
 * Does not replace plain `portalCaptchaVerifiedLoopSleep` (Verified poll / settle).
 */
export const waitPortalCaptchaVerifiedLoopMs = (
  ms: number,
  abortSignal?: AbortSignal,
): Promise<void> =>
  new Promise((resolve) => {
    if (ms <= 0 || abortSignal?.aborted === true) {
      resolve();
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const settle = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      abortSignal?.removeEventListener('abort', onAbort);
      resolve();
    };

    const onAbort = () => {
      settle();
    };

    timer = setTimeout(settle, ms);
    abortSignal?.addEventListener('abort', onAbort);
  });
