/**
 * Align CRM gender enum (`female` / `male`) to portal dropdown labels.
 * Unknown values pass through trimmed — never invent a gender.
 */
export const mapEditMemberGenderPortalLabel = (
  gender: string,
): string => {
  const trimmed = gender.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'female') {
    return 'Female';
  }
  if (lower === 'male') {
    return 'Male';
  }
  return trimmed;
};
