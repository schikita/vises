/**
 * Abort cooperation for workflow-driven fill façades (DEC-001).
 * Fill must not import bls-workflow — clients pass signal + close callback.
 */

/** Force-close the launched Patchright browser (idempotent). */
export type PortalFillBrowserClose = () => Promise<void>;

/**
 * Invoked after successful `chromium.launch` so callers can register
 * the close hook with the workflow abort registry.
 */
export type PortalFillOnBrowserLaunched = (
  close: PortalFillBrowserClose,
) => void;

/** Optional abort fields shared by workflow-used fill option types. */
export type PortalFillAbortCooperation = {
  abortSignal?: AbortSignal;
  onBrowserLaunched?: PortalFillOnBrowserLaunched;
};
