/** Result of waiting for `.preloader` / `#global-overlay` to stop blocking. */
export type WaitForPortalOverlaysClearResult =
  | { clear: true; via: 'already_clear' | 'cleared' }
  | { clear: false; via: 'timeout' | 'error'; reason: string };
