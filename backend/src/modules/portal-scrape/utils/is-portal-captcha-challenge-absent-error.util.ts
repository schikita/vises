/**
 * True when frame/challenge is missing (DEC-002 adaptive `#btnVerify` trigger).
 * Decoy/extract mismatches are not absent — those consume outer budget only.
 */
export const isPortalCaptchaChallengeAbsentError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('CAPTCHA iframe not attached') ||
    msg.includes('CAPTCHA iframe frame/content not ready') ||
    msg.includes('CAPTCHA challenge root not visible')
  );
};
