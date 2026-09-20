/**
 * Whether `submitCountry` is allowed for the Belarus-only adapter era (A-MS-1).
 * Empty or case-insensitive `Belarus` → true; others → false (fail closed later).
 */
export const isPortalSubmitCountryBelarusAllowlisted = (
  submitCountry: string | null | undefined,
): boolean => {
  const trimmed = (submitCountry ?? '').trim().toLowerCase();
  return trimmed === '' || trimmed === 'belarus';
};
