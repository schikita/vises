import type { ClientListDto } from '@vises/contracts';

/**
 * Filter list rows by name or masked passport (DEC-P3).
 * Operates on already-mapped list DTOs (plaintext names + list mask only).
 */
export const filterClientsListBySearch = (
  rows: readonly ClientListDto[],
  search: string,
): ClientListDto[] => {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return [...rows];
  }

  return rows.filter((row): boolean => {
    const first = row.firstName.toLowerCase();
    const last = row.lastName.toLowerCase();
    const full = `${first} ${last}`.trim();
    const passport = row.maskedPassport.toLowerCase();
    return (
      first.includes(needle) ||
      last.includes(needle) ||
      full.includes(needle) ||
      passport.includes(needle)
    );
  });
};
