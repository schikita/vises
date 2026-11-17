import type { AnalyticsApplicationFact } from '../types';
import { filterFactsByCreatedAt } from './filter-facts-by-created-at.util';

const makeFact = (
  applicationId: string,
  createdAt: Date,
): AnalyticsApplicationFact => ({
  applicationId,
  agentId: 'agent-a',
  effectiveStatus: 'draft',
  receivedAt: null,
  bookedAt: null,
  createdAt,
  paymentPaid: false,
  paymentAmount: 0,
  submitCity: 'Moscow',
  visitDate: '',
});

describe('filterFactsByCreatedAt', (): void => {
  const early = makeFact('a1', new Date('2025-12-15T00:00:00.000Z'));
  const mid = makeFact('a2', new Date('2026-01-15T00:00:00.000Z'));
  const late = makeFact('a3', new Date('2026-02-15T00:00:00.000Z'));

  it('returns all facts when dateRange is null', (): void => {
    expect(filterFactsByCreatedAt([early, mid, late], null)).toEqual([
      early,
      mid,
      late,
    ]);
  });

  it('includes only apps whose createdAt falls in the inclusive range', (): void => {
    const filtered = filterFactsByCreatedAt([early, mid, late], {
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-31T23:59:59.999Z'),
    });
    expect(filtered.map((f) => f.applicationId)).toEqual(['a2']);
  });

  it('supports open-ended from/to bounds', (): void => {
    const fromOnly = filterFactsByCreatedAt([early, mid, late], {
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: null,
    });
    expect(fromOnly.map((f) => f.applicationId)).toEqual(['a2', 'a3']);

    const toOnly = filterFactsByCreatedAt([early, mid, late], {
      from: null,
      to: new Date('2026-01-31T23:59:59.999Z'),
    });
    expect(toOnly.map((f) => f.applicationId)).toEqual(['a1', 'a2']);
  });

  it('includes facts when createdAt equals from or to (inclusive)', (): void => {
    const atFrom = makeFact('eq-from', new Date('2026-01-01T00:00:00.000Z'));
    const atTo = makeFact('eq-to', new Date('2026-01-31T23:59:59.999Z'));
    const filtered = filterFactsByCreatedAt([atFrom, atTo], {
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-31T23:59:59.999Z'),
    });
    expect(filtered.map((f) => f.applicationId)).toEqual(['eq-from', 'eq-to']);
  });
});
