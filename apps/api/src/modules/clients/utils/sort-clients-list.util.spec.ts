import type { ClientListDto } from '@vises/contracts';
import { sortClientsList } from './sort-clients-list.util';

const row = (
  partial: Partial<ClientListDto> & Pick<ClientListDto, 'id'>,
): ClientListDto => ({
  agentId: 'agent-1',
  agentName: 'Agent',
  firstName: 'Ada',
  lastName: 'Lovelace',
  maskedPassport: 'AB****67',
  status: 'drafting',
  routeFrom: 'Warsaw',
  routeTo: 'Berlin',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...partial,
});

describe('sortClientsList (DEC-P16)', (): void => {
  it('sorts by agentName ascending', (): void => {
    const sorted = sortClientsList(
      [
        row({ id: '1', agentName: 'Zoe' }),
        row({ id: '2', agentName: 'Amy' }),
      ],
      'agentName',
      'asc',
    );
    expect(sorted.map((r) => r.id)).toEqual(['2', '1']);
  });

  it('sorts by route and status with direction', (): void => {
    const byRoute = sortClientsList(
      [
        row({ id: '1', routeFrom: 'B', routeTo: 'Y' }),
        row({ id: '2', routeFrom: 'A', routeTo: 'Z' }),
      ],
      'route',
      'asc',
    );
    expect(byRoute.map((r) => r.id)).toEqual(['2', '1']);

    const byStatus = sortClientsList(
      [
        row({ id: '1', status: 'pending' }),
        row({ id: '2', status: 'drafting' }),
      ],
      'status',
      'desc',
    );
    expect(byStatus.map((r) => r.id)).toEqual(['1', '2']);
  });

  it('defaults createdAt desc newest first', (): void => {
    const sorted = sortClientsList(
      [
        row({ id: 'old', createdAt: '2026-01-01T00:00:00.000Z' }),
        row({ id: 'new', createdAt: '2026-02-01T00:00:00.000Z' }),
      ],
      'createdAt',
      'desc',
    );
    expect(sorted.map((r) => r.id)).toEqual(['new', 'old']);
  });
});
