/** True when the optional AbortSignal has already been aborted. */
export const isPortalFillAbortRequested = (
  abortSignal?: AbortSignal,
): boolean => abortSignal?.aborted === true;
