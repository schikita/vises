import { IsOptional, IsString } from 'class-validator';

/**
 * Query for `GET /agents/:agentId/balance/transactions` (qa-polish DEC-P4).
 * Normalized via `parseBalanceTransactionsQuery`.
 */
export class BalanceTransactionsQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;
}
