import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Append-only audit / UI poll stream (REQ-029 / DEC-020).
 * `payload_safe` must never contain secrets.
 */
@Entity({ name: 'bls_workflow_events' })
@Index(['workflowId'])
@Index(['workflowId', 'id'])
@Index(['createdAt'])
export class BlsWorkflowEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'workflow_id', type: 'varchar', length: 40 })
  workflowId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType!: string;

  @Column({
    name: 'step_key',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  stepKey!: string | null;

  @Column({
    name: 'task_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  taskKey!: string | null;

  @Column({ name: 'payload_safe', type: 'jsonb', default: () => "'{}'::jsonb" })
  payloadSafe!: Record<string, unknown>;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;
}
