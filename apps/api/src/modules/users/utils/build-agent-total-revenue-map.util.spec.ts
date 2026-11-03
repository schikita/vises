import { buildAgentTotalRevenueMap } from './build-agent-total-revenue-map.util';

describe('buildAgentTotalRevenueMap (DEC-P13)', (): void => {
  it('defaults missing agents to 0.00 and formats sums', (): void => {
    const map = buildAgentTotalRevenueMap(
      ['a1', 'a2'],
      [{ agentId: 'a1', total: '180' }],
    );
    expect(map.get('a1')).toBe('180.00');
    expect(map.get('a2')).toBe('0.00');
  });
});
