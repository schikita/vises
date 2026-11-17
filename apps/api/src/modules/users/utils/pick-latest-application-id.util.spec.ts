import { pickLatestApplicationId } from './pick-latest-application-id.util';

describe('pickLatestApplicationId', (): void => {
  it('returns null for empty list', (): void => {
    expect(pickLatestApplicationId([])).toBeNull();
  });

  it('prefers greater updatedAt', (): void => {
    expect(
      pickLatestApplicationId([
        {
          id: 'a',
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          createdAt: new Date('2026-06-01T00:00:00Z'),
        },
        {
          id: 'b',
          updatedAt: new Date('2026-02-01T00:00:00Z'),
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      ]),
    ).toBe('b');
  });

  it('breaks updatedAt ties with createdAt', (): void => {
    const sameUpdated = new Date('2026-04-01T00:00:00Z');
    expect(
      pickLatestApplicationId([
        {
          id: 'older',
          updatedAt: sameUpdated,
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
        {
          id: 'newer',
          updatedAt: sameUpdated,
          createdAt: new Date('2026-02-01T00:00:00Z'),
        },
      ]),
    ).toBe('newer');
  });
});
