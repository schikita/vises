import { parseAnalyticsDateBound } from './parse-analytics-date-bound.util';

describe('parseAnalyticsDateBound', (): void => {
  it('expands YYYY-MM-DD to UTC day start for from', (): void => {
    expect(parseAnalyticsDateBound('2026-01-15', 'start')).toEqual(
      new Date(Date.UTC(2026, 0, 15, 0, 0, 0, 0)),
    );
  });

  it('expands YYYY-MM-DD to UTC day end for to', (): void => {
    expect(parseAnalyticsDateBound('2026-01-15', 'end')).toEqual(
      new Date(Date.UTC(2026, 0, 15, 23, 59, 59, 999)),
    );
  });

  it('parses full ISO datetimes as-is', (): void => {
    const raw = '2026-01-15T12:30:00.000Z';
    expect(parseAnalyticsDateBound(raw, 'start')).toEqual(new Date(raw));
    expect(parseAnalyticsDateBound(raw, 'end')).toEqual(new Date(raw));
  });
});
