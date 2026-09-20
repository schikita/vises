/** Raw TypeORM aggregate row for status/day COUNT queries. */
export type StatsRawCountRow = {
  status?: string;
  date?: string;
  count: string | number;
};
