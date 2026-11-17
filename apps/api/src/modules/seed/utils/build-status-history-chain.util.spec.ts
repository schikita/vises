import { APPLICATION_STATUS_TRANSITION_MATRIX } from '@vises/contracts';
import type { ApplicationStatus } from '@vises/contracts';
import { buildStatusHistoryChain } from './build-status-history-chain.util';

const isMatrixEdge = (from: string | null, to: string): boolean =>
  APPLICATION_STATUS_TRANSITION_MATRIX.some(
    (row) => row.source === from && row.target === to,
  );

const assertMatrixValid = (
  chain: ReturnType<typeof buildStatusHistoryChain>,
): void => {
  for (const step of chain) {
    expect(isMatrixEdge(step.fromStatus, step.toStatus)).toBe(true);
  }
};

describe('buildStatusHistoryChain (§4.C / REQ-005)', (): void => {
  const agentId = 'u-agent-01';

  it('returns empty chain for draft (no history on create)', (): void => {
    expect(buildStatusHistoryChain('draft', agentId)).toEqual([]);
  });

  it('returns empty chain for filling (create-like)', (): void => {
    expect(buildStatusHistoryChain('filling', agentId)).toEqual([]);
  });

  it('includes draft→not_ready_for_appointment for not_ready_for_appointment', (): void => {
    const chain = buildStatusHistoryChain('not_ready_for_appointment', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'draft->not_ready_for_appointment',
    ]);
    expect(chain[0]?.actorRole).toBe('visa_center_monitor');
    assertMatrixValid(chain);
  });

  it('includes monitor edge then not_ready→declined for declined', (): void => {
    const chain = buildStatusHistoryChain('declined', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'draft->not_ready_for_appointment',
      'not_ready_for_appointment->declined',
    ]);
    expect(chain[1]?.actorId).toBe(agentId);
    expect(chain[1]?.actorRole).toBe('agent');
    assertMatrixValid(chain);
  });

  it('includes monitor edge then not_ready→ready for ready_for_appointment', (): void => {
    const chain = buildStatusHistoryChain('ready_for_appointment', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'draft->not_ready_for_appointment',
      'not_ready_for_appointment->ready_for_appointment',
    ]);
    expect(chain[1]?.actorId).toBe(agentId);
    expect(chain[1]?.actorRole).toBe('agent');
    assertMatrixValid(chain);
  });

  it('includes monitor→ready→booked for booked', (): void => {
    const chain = buildStatusHistoryChain('booked', agentId);
    expect(chain.map((s) => `${s.fromStatus}->${s.toStatus}`)).toEqual([
      'draft->not_ready_for_appointment',
      'not_ready_for_appointment->ready_for_appointment',
      'ready_for_appointment->booked',
    ]);
    expect(chain[2]?.actorId).toBe(agentId);
    expect(chain[2]?.actorRole).toBe('agent');
    assertMatrixValid(chain);
  });

  it('covers all six BUSINESS finals with matrix-valid edges only', (): void => {
    const finals: readonly ApplicationStatus[] = [
      'filling',
      'draft',
      'not_ready_for_appointment',
      'ready_for_appointment',
      'booked',
      'declined',
    ];
    const pairs = finals.flatMap((status) =>
      buildStatusHistoryChain(status, agentId).map(
        (s) => `${s.fromStatus}->${s.toStatus}`,
      ),
    );
    expect(pairs).not.toContain('drafting->pending');
    expect(pairs).not.toContain('booked->issued');
    expect(pairs).not.toContain('pending->booked');

    for (const status of finals) {
      assertMatrixValid(buildStatusHistoryChain(status, agentId));
    }
  });
});
