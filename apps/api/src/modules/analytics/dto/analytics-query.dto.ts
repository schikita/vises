import { IsOptional, IsString, Matches } from 'class-validator';
import {
  ANALYTICS_DATE_QUERY_PATTERN,
  ANALYTICS_DATE_QUERY_PATTERN_MESSAGE,
} from '../constants';

/**
 * Query for `GET /stats/roles-applications`.
 * Both date bounds omitted → current totals. Either/both → filter by receivedAt.
 * `page`/`pageSize` paginate only `perAgent` (qa-polish DEC-P2 / DEC-P14).
 * Optional `q` filters `perAgent` agent universe before pagination (DEC-P15).
 */
export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(ANALYTICS_DATE_QUERY_PATTERN, {
    message: ANALYTICS_DATE_QUERY_PATTERN_MESSAGE,
  })
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(ANALYTICS_DATE_QUERY_PATTERN, {
    message: ANALYTICS_DATE_QUERY_PATTERN_MESSAGE,
  })
  to?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
