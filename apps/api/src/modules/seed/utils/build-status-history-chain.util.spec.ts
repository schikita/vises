import { buildStatusHistoryChain } from './build-status-history-chain.util';

describe('buildStatusHistoryChain', (): void => {
  const agentId = 'u-agent-01';

  it('returns empty chain for drafting (no history on create)', (): void => {
    expect(buildStatusHistoryChain('drafting', agentId)).toEqual([]);
  });

  it('includes drafting→pending for pending', (): void => {
    const chain = buildStatusHistoryChain('pending', agentId);
    expect(chain).toHaveLength(1);
    expect(chain[0]?.fromStatus).toBe('drafting');
    expect(chain[0]?.toStatus).toBe('pending');
    expect(chain[0]?.actorRole).toBe('visa_center_monitor');
  });

  it('includes drafting→pending and pending→rejected for rejected', (): void => {
    const chain = buildStatusHistoryChain('rejected', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'drafting->pending',
      'pending->rejected',
    ]);
  });

  it('includes drafting→pending and pending→booked for booked', (): void => {
    const chain = buildStatusHistoryChain('booked', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'drafting->pending',
      'pending->booked',
    ]);
  });

  it('includes drafting→pending, pending→booked, booked→issued for issued', (): void => {
    const chain = buildStatusHistoryChain('issued', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'drafting->pending',
      'pending->booked',
      'booked->issued',
    ]);
    expect(chain[2]?.actorId).toBe(agentId);
    expect(chain[2]?.actorRole).toBe('agent');
  });
});
