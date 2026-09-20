/** Resolved UTC day window for dashboard day-series queries. */
export type DashboardDateRange = {
  rangeDays: number;
  /** Inclusive start (UTC midnight). */
  from: Date;
  /** Exclusive end (UTC midnight after last day). */
  toExclusive: Date;
  /** Inclusive start as ISO string. */
  fromIso: string;
  /** Inclusive end-of-last-day as ISO string. */
  toIso: string;
  /** Contiguous UTC day keys `YYYY-MM-DD` for the window. */
  dayKeys: string[];
};
