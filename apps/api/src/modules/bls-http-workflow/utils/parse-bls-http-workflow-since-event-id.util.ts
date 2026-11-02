/**
 * Parse optional `sinceEventId` query for events poll cursor.
 * Missing / invalid → 0 (return events with id > 0).
 */
export const parseBlsHttpWorkflowSinceEventId = (
  raw: string | undefined,
): number => {
  if (raw === undefined || raw.trim() === '') {
    return 0;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
};
