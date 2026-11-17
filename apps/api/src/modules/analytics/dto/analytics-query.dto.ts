import { IsOptional, IsString, Matches } from 'class-validator';
import {
  ANALYTICS_DATE_QUERY_PATTERN,
  ANALYTICS_DATE_QUERY_PATTERN_MESSAGE,
} from '../constants';

/**
 * Query for `GET /stats/roles-applications` (FR-15).
 * Both omitted → current totals. Either/both → filter status metrics by
 * application `createdAt`.
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
}
