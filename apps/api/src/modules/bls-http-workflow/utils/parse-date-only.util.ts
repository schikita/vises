import type { ParseDateOnlyResult } from '../types/bls-applicant-date.types';

const DATE_ONLY_YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Strict date-only parse: trim; whitespace → missing; else `YYYY-MM-DD` with
 * a real civil calendar day (REQ-004 / CON-003 / DEC-007).
 * Also accepts `YYYY-MM-DDTHH:mm:ss…` by taking the date prefix (legacy rows).
 */
export const parseDateOnly = (raw: string | null | undefined): ParseDateOnlyResult => {
  if (raw == null) {
    return { status: 'missing' };
  }
  const trimmed = String(raw).trim();
  if (trimmed.length === 0) {
    return { status: 'missing' };
  }

  const isoPrefix = /^(\d{4}-\d{2}-\d{2})T/.exec(trimmed);
  const candidate = isoPrefix ? isoPrefix[1] : trimmed;

  const match = DATE_ONLY_YMD_RE.exec(candidate);
  if (!match) {
    return { status: 'unparseable' };
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
    return { status: 'unparseable' };
  }

  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > maxDay) {
    return { status: 'unparseable' };
  }

  const ymd = `${match[1]}-${match[2]}-${match[3]}`;
  return { status: 'ok', ymd, parts: { year, month, day } };
};
