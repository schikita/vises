/**
 * Normalize agent balance for `GET /auth/me` as a decimal string (NFR-1 / §6.1).
 * Avoids floating-point; TypeORM numeric often arrives as string already.
 */
export const formatAgentBalance = (
  balance: string | null | undefined,
): string => {
  if (balance == null || balance === '') {
    return '0';
  }
  return String(balance);
};
