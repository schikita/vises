import type { DateOnlyParts } from '../types/bls-applicant-date.types';

/**
 * Add `months` with year carry; clamp day to last day of target month (DEC-007).
 */
export const addCalendarMonths = (
  parts: DateOnlyParts,
  months: number,
): DateOnlyParts => {
  const totalMonths = parts.year * 12 + (parts.month - 1) + months;
  let year = Math.floor(totalMonths / 12);
  let monthIndex = totalMonths % 12;
  if (monthIndex < 0) {
    monthIndex += 12;
    year -= 1;
  }
  const month = monthIndex + 1;
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = parts.day > maxDay ? maxDay : parts.day;
  return { year, month, day };
};
