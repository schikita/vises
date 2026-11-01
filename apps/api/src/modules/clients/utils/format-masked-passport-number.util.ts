/**
 * Single-string passport mask for list rows (Decision 2A / ClientListDto).
 * Example: `"AB1234567"` → `"AB****67"`. Empty / missing → `""`.
 */
export const formatMaskedPassportNumber = (
  passportNumber: string | null | undefined,
): string => {
  if (
    passportNumber === null ||
    passportNumber === undefined ||
    passportNumber === ''
  ) {
    return '';
  }
  if (passportNumber.length < 4) {
    return '****';
  }
  return `${passportNumber.slice(0, 2)}****${passportNumber.slice(-2)}`;
};
