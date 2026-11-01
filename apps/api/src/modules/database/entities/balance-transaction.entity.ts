import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { BalanceTransactionType } from '@vises/contracts';

/**
 * Append-only agent balance ledger (FR-4 / NFR-4).
 * Monetary columns are `numeric` stored/read as decimal strings (NFR-1).
 */
@Entity({ name: 'balance_transactions' })
export class BalanceTransaction {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Index()
  @Column({ name: 'agent_id', type: 'varchar', length: 40 })
  agentId!: string;

  @Column({ name: 'actor_id', type: 'varchar', length: 40 })
  actorId!: string;

  @Column({ type: 'varchar', length: 40 })
  type!: BalanceTransactionType;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: string;

  @Column({ type: 'text', default: '' })
  reason!: string;

  @Column({
    name: 'resulting_balance',
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  resultingBalance!: string;

  @Index()
  @Column({ name: 'client_id', type: 'varchar', length: 40, nullable: true })
  clientId!: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;
}
