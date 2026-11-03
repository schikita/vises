import { agentMatchesAnalyticsQ } from './agent-matches-analytics-q.util';

describe('agentMatchesAnalyticsQ (DEC-P15)', (): void => {
  const agentsById = new Map([
    ['agent-a', { id: 'agent-a', login: 'alice', name: 'Alice Agent' }],
    ['agent-b', { id: 'agent-b', login: 'bob', name: 'Bob Agent' }],
  ]);

  it('matches everything when q is empty or whitespace', (): void => {
    expect(agentMatchesAnalyticsQ('agent-a', '', agentsById)).toBe(true);
    expect(agentMatchesAnalyticsQ('agent-a', '   ', agentsById)).toBe(true);
  });

  it('matches agent id case-insensitively without lookup', (): void => {
    expect(agentMatchesAnalyticsQ('agent-b', 'AGENT-B', new Map())).toBe(true);
  });

  it('matches login and name via lookup', (): void => {
    expect(agentMatchesAnalyticsQ('agent-a', 'ali', agentsById)).toBe(true);
    expect(agentMatchesAnalyticsQ('agent-a', 'ALICE AGENT', agentsById)).toBe(
      true,
    );
    expect(agentMatchesAnalyticsQ('agent-a', 'bob', agentsById)).toBe(false);
  });

  it('returns false when lookup is missing for non-id matches', (): void => {
    expect(agentMatchesAnalyticsQ('agent-a', 'alice', new Map())).toBe(false);
  });
});
