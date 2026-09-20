/**
 * Heuristic: terminal reason looks like a portal captcha / Verified mismatch
 * (REQ-011c) without requiring CapMonster permanent failure.
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
    lower.includes('bls')
  );
};
