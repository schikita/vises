import { Application } from '../../database/entities/application.entity';
import { resolveLatestAppIdForAgent } from './resolve-latest-app-id-for-agent.util';

describe('resolveLatestAppIdForAgent (DEC-P6)', (): void => {
  it('returns null when agent has no clients', (): void => {
    expect(
      resolveLatestAppIdForAgent(
        [
          Object.assign(new Application(), {
            id: 'app-1',
            clientId: 'cli-1',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
        ],
        new Set(),
      ),
    ).toBeNull();
  });

  it('picks latest application among agent-owned clients', (): void => {
    const apps = [
      Object.assign(new Application(), {
        id: 'app-old',
        clientId: 'cli-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      Object.assign(new Application(), {
        id: 'app-new',
        clientId: 'cli-2',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      Object.assign(new Application(), {
        id: 'app-other',
        clientId: 'cli-other',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      }),
    ];

    expect(
      resolveLatestAppIdForAgent(apps, new Set(['cli-1', 'cli-2'])),
    ).toBe('app-new');
  });
});
