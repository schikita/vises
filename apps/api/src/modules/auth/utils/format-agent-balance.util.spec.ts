import { formatAgentBalance } from './format-agent-balance.util';

describe('formatAgentBalance (NFR-1)', (): void => {
  it('returns decimal strings without floating-point conversion', (): void => {
    expect(formatAgentBalance('360.00')).toBe('360.00');
    expect(formatAgentBalance('0')).toBe('0');
    expect(formatAgentBalance(null)).toBe('0');
    expect(formatAgentBalance(undefined)).toBe('0');
    expect(formatAgentBalance('')).toBe('0');
  });
});
