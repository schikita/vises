/**
 * Heuristic: terminal reason looks like a portal captcha / Verified mismatch
 * (REQ-011c) without requiring captcha-service permanent failure.
 *
 * Do not match bare "bls" — portal hostnames like `blsspainbelarus.by` appear in
 * navigation timeouts and produced false captcha-retry button labels.
 */
export const looksLikePortalCaptchaMismatchReason = (
  terminalReason: string | null | undefined,
): boolean => {
  if (typeof terminalReason !== 'string') {
    return false;
  }
  const lower = terminalReason.toLowerCase();
  return (
    lower.includes('verified') ||
    lower.includes('captcha') ||
    lower.includes('capmonster')
  );
};
