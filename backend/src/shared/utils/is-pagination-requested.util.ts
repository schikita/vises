/**
 * Opt-in pagination detection (DEC-006): presence of `page` and/or `pageSize`
 * query keys switches handlers from legacy array → envelope.
 */
export const isPaginationRequested = (
  page: string | undefined,
  pageSize: string | undefined,
): boolean => page !== undefined || pageSize !== undefined;
