import { DEFAULT_PAGE_SIZE } from '../../../shared/constants/pagination.constants';
import { parseAnalyticsPagination } from './parse-analytics-pagination.util';

describe('parseAnalyticsPagination (DEC-P1 / DEC-P2 / DEC-P14)', (): void => {
  it('defaults page=1 and shared DEFAULT_PAGE_SIZE when omitted', (): void => {
    expect(parseAnalyticsPagination({})).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it('parses string page and pageSize (QA limit≡pageSize)', (): void => {
    expect(
      parseAnalyticsPagination({ page: '2', pageSize: '5' }),
    ).toEqual({
      page: 2,
      pageSize: 5,
    });
  });

  it('clamps invalid page to 1', (): void => {
    expect(parseAnalyticsPagination({ page: '0', pageSize: 5 })).toEqual({
      page: 1,
      pageSize: 5,
    });
  });
});
