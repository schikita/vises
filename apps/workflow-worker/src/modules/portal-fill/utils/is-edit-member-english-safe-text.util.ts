/**
 * Portal `validateEnglish` strips non-allowed chars — refuse values that
 * would not survive read-back (letters, digits, common punctuation/space).
 */
export const isEditMemberEnglishSafeText = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }
  // Allow ASCII letters, digits, and common address/name punctuation.
  return /^[\x20-\x7E]+$/.test(trimmed);
};
