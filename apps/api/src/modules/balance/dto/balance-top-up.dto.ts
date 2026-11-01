import { IsString } from 'class-validator';

/**
 * Nest body for `POST /agents/:agentId/balance/top-up`.
 * Mirrors `@vises/contracts` `BalanceTopUpDto` (T1 freeze / AC-8).
 */
export class BalanceTopUpDto {
  /** Positive decimal string (NFR-1); validated in service as `invalid_amount`. */
  @IsString()
  amount!: string;
}
