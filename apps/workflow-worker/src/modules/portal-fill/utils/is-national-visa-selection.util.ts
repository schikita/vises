/**
 * Detect National visa category from application pre-start selection (OQ-003).
 * Avoids false positives on strings containing "international".
 */
export const isNationalVisaSelection = (
  visaType: string | undefined | null,
): boolean => {
  const collapsed = String(visaType ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!collapsed) {
    return false;
  }
  if (collapsed === 'national' || collapsed === 'national visa') {
    return true;
  }
  if (collapsed.includes('international')) {
    return false;
  }
  return /(?:^|[^a-z])national(?:\s+visa)?(?:$|[^a-z])/.test(collapsed);
};
