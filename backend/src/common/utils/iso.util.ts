/** Parity with Python `iso(days_ago, hour)` for seed timeline timestamps. */
export function iso(daysAgo: number, hour = 11): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 20, 0, 0);
  return d.toISOString();
}

/** Parity with Python `iso(dt)` for API serializers (`user_out` / `app_out`). */
export function formatIso(dt: Date | null | undefined): string {
  return dt ? dt.toISOString() : '';
}

export function utcNow(): Date {
  return new Date();
}
