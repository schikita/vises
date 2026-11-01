import { formatPricePerClient } from './format-price-per-client.util';

describe('formatPricePerClient (AC-4 / FR-3 / NFR-1)', (): void => {
  it('maps integer defaultPrice to a decimal string', (): void => {
    expect(formatPricePerClient(180)).toBe('180.00');
    expect(formatPricePerClient(0)).toBe('0.00');
    expect(formatPricePerClient(1999)).toBe('1999.00');
  });
});
