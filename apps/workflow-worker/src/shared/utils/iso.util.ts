/** Parity with Python `iso(days_ago, hour)` for seed timeline timestamps. */
export const iso = (daysAgo: number, hour = 11): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 20, 0, 0);
  return d.toISOString();
};
