import { IsString } from 'class-validator';

/**
 * Nest body for `POST /agents/:agentId/balance/adjust`.
 * Mirrors `@vises/contracts` `BalanceAdjustDto` (T1 freeze / AC-8).
 */
export class BalanceAdjustDto {
  /** Signed decimal string (NFR-1); validated in service as `invalid_amount`. */
  @IsString()
  amount!: string;

  /** Non-empty after trim (FR-4); whitespace → `reason_required`. */
  @IsString()
  reason!: string;
}
