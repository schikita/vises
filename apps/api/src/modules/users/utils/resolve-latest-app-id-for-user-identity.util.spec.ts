import type { Application } from '../../database/entities/application.entity';
import type { AgentOwnedApplicationRow } from '../types/agent-owned-application-row.types';
import type { ResolveLatestAppIdUser } from '../types/resolve-latest-app-id-user.types';
import { resolveLatestAppIdForUserIdentity } from './resolve-latest-app-id-for-user-identity.util';

const makeApp = (
  partial: Pick<Application, 'id' | 'clientEmail'> &
    Partial<Pick<Application, 'updatedAt' | 'createdAt'>>,
): Application =>
  ({
    updatedAt: partial.updatedAt ?? new Date('2026-01-01T00:00:00Z'),
    createdAt: partial.createdAt ?? new Date('2026-01-01T00:00:00Z'),
    ...partial,
  }) as Application;

const makeUser = (
  partial: Partial<ResolveLatestAppIdUser> &
    Pick<ResolveLatestAppIdUser, 'id' | 'role'>,
): ResolveLatestAppIdUser => ({
  email: partial.email ?? `${partial.id}@example.com`,
  login: partial.login ?? partial.id,
  ...partial,
});

describe('resolveLatestAppIdForUserIdentity (ASAU-TASK-003 / DEC-ASAU-005)', (): void => {
  it('resolves non-agent latestAppId via email/login identity match', (): void => {
    const apps = [
      makeApp({
        id: 'app-old',
        clientEmail: 'client@example.com',
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      }),
      makeApp({
        id: 'app-new',
        clientEmail: 'client@example.com',
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      }),
      makeApp({
        id: 'app-other',
        clientEmail: 'other@example.com',
        updatedAt: new Date('2026-03-01T00:00:00Z'),
      }),
    ];
    const user = makeUser({
      id: 'u-admin',
      role: 'admin',
      email: 'client@example.com',
      login: 'admin-login',
    });

    expect(resolveLatestAppIdForUserIdentity(apps, user)).toBe('app-new');
  });

  it('returns null for non-agent when no email/login apps match', (): void => {
    const apps = [
      makeApp({ id: 'app-1', clientEmail: 'someone-else@example.com' }),
    ];
    const user = makeUser({
      id: 'u-admin',
      role: 'admin',
      email: 'admin@example.com',
      login: 'admin',
    });

    expect(resolveLatestAppIdForUserIdentity(apps, user)).toBeNull();
  });

  it('agent with owned apps but mismatched email gets non-null latestAppId', (): void => {
    const emailMatchedPool: Application[] = [
      makeApp({
        id: 'app-email-only',
        clientEmail: 'unrelated-client@example.com',
        updatedAt: new Date('2026-06-01T00:00:00Z'),
      }),
    ];
    const agentOwned: AgentOwnedApplicationRow[] = [
      {
        id: 'app-owned-old',
        agentId: 'agent-1',
        updatedAt: new Date('2026-01-10T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 'app-owned-latest',
        agentId: 'agent-1',
        updatedAt: new Date('2026-03-01T00:00:00Z'),
        createdAt: new Date('2026-02-01T00:00:00Z'),
      },
    ];
    const byAgent = new Map<string, AgentOwnedApplicationRow[]>([
      ['agent-1', agentOwned],
    ]);
    const agent = makeUser({
      id: 'agent-1',
      role: 'agent',
      email: 'agent@agency.example',
      login: 'agent-1',
    });

    const latestAppId = resolveLatestAppIdForUserIdentity(
      emailMatchedPool,
      agent,
      byAgent,
    );

    expect(latestAppId).toBe('app-owned-latest');
    expect(latestAppId).not.toBeNull();
  });

  it('agent latestAppId is null only when zero owned apps (AC-010)', (): void => {
    const agent = makeUser({
      id: 'agent-empty',
      role: 'agent',
      email: 'agent-empty@example.com',
      login: 'agent-empty',
    });
    const emailPool = [
      makeApp({
        id: 'app-by-email',
        clientEmail: 'agent-empty@example.com',
        updatedAt: new Date('2026-05-01T00:00:00Z'),
      }),
    ];

    expect(
      resolveLatestAppIdForUserIdentity(
        emailPool,
        agent,
        new Map([['agent-empty', []]]),
      ),
    ).toBeNull();
    expect(resolveLatestAppIdForUserIdentity(emailPool, agent)).toBeNull();
  });

  it('agent picks max updatedAt then createdAt among owned apps', (): void => {
    const owned: AgentOwnedApplicationRow[] = [
      {
        id: 'tie-older-created',
        agentId: 'agent-2',
        updatedAt: new Date('2026-04-01T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 'tie-newer-created',
        agentId: 'agent-2',
        updatedAt: new Date('2026-04-01T00:00:00Z'),
        createdAt: new Date('2026-03-01T00:00:00Z'),
      },
    ];
    const agent = makeUser({ id: 'agent-2', role: 'agent' });

    expect(
      resolveLatestAppIdForUserIdentity(
        [],
        agent,
        new Map([['agent-2', owned]]),
      ),
    ).toBe('tie-newer-created');
  });
});
