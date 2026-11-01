import type { AnalyticsApplicationFact } from '../types';
import { filterFactsByReceivedAt } from './filter-facts-by-received-at.util';

const fact = (
  id: string,
  receivedAt: Date | null,
): AnalyticsApplicationFact => ({
  applicationId: id,
  agentId: 'agent-1',
  effectiveStatus: 'pending',
  receivedAt,
  issuedAt: null,
});

describe('filterFactsByReceivedAt (AC-15b)', (): void => {
  const early = fact('a1', new Date('2026-01-05T12:00:00.000Z'));
  const mid = fact('a2', new Date('2026-01-15T12:00:00.000Z'));
  const late = fact('a3', new Date('2026-01-25T12:00:00.000Z'));
  const never = fact('a4', null);

  it('returns all facts when dateRange is null (current totals)', (): void => {
    expect(
      filterFactsByReceivedAt([early, mid, late, never], null),
    ).toEqual([early, mid, late, never]);
  });

  it('includes only apps whose receivedAt falls in the inclusive range', (): void => {
    const filtered = filterFactsByReceivedAt([early, mid, late, never], {
      from: new Date('2026-01-10T00:00:00.000Z'),
      to: new Date('2026-01-20T23:59:59.999Z'),
    });
    expect(filtered.map((f) => f.applicationId)).toEqual(['a2']);
  });

  it('excludes apps with null receivedAt when filtering', (): void => {
    const filtered = filterFactsByReceivedAt([never, mid], {
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-12-31T23:59:59.999Z'),
    });
    expect(filtered.map((f) => f.applicationId)).toEqual(['a2']);
  });

  it('supports open-ended from/to bounds', (): void => {
    const fromOnly = filterFactsByReceivedAt([early, mid, late], {
      from: new Date('2026-01-15T00:00:00.000Z'),
      to: null,
    });
    expect(fromOnly.map((f) => f.applicationId)).toEqual(['a2', 'a3']);

    const toOnly = filterFactsByReceivedAt([early, mid, late], {
      from: null,
      to: new Date('2026-01-15T23:59:59.999Z'),
    });
    expect(toOnly.map((f) => f.applicationId)).toEqual(['a1', 'a2']);
  });

  it('includes facts when receivedAt equals from or to (inclusive)', (): void => {
    const atFrom = fact('eq-from', new Date('2026-01-10T00:00:00.000Z'));
    const atTo = fact('eq-to', new Date('2026-01-20T23:59:59.999Z'));
    const filtered = filterFactsByReceivedAt([atFrom, atTo], {
      from: new Date('2026-01-10T00:00:00.000Z'),
      to: new Date('2026-01-20T23:59:59.999Z'),
    });
    expect(filtered.map((f) => f.applicationId)).toEqual(['eq-from', 'eq-to']);
  });
});
