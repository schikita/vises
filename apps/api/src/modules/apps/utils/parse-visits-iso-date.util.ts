const VISITS_ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Accept calendar `YYYY-MM-DD` for visits from/to; invalid → null. */
export const parseVisitsIsoDate = (
  raw: string | undefined,
): string | null => {
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') {
    return null;
  }
  const match = VISITS_ISO_DATE_RE.exec(trimmed);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > maxDay) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
};
