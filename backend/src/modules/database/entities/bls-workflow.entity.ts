import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Durable BLS multi-stage workflow root (REQ-001 / REQ-026 / DEC-012).
 * Source of truth for orchestration; one active non-terminal per application
 * (partial unique enforced in schema.bootstrap).
 * Status literals live in portal-scrape constants — no feature import here.
 */
@Entity({ name: 'bls_workflows' })
@Index(['applicationId'])
@Index(['status', 'nextRunAt'])
@Index(['applicationId', 'createdAt'])
@Index(['lockHeartbeatAt'])
export class BlsWorkflow {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ name: 'application_id', type: 'varchar', length: 40 })
  applicationId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({
    name: 'terminal_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  terminalReason!: string | null;

  @Column({
    name: 'next_run_at',
    type: 'timestamptz',
    nullable: true,
  })
  nextRunAt!: Date | null;

  @Column({
    name: 'lock_owner',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  lockOwner!: string | null;

  @Column({
    name: 'lock_heartbeat_at',
    type: 'timestamptz',
    nullable: true,
  })
  lockHeartbeatAt!: Date | null;

  @Column({
    name: 'current_step_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  currentStepKey!: string | null;

  @Column({
    name: 'current_task_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  currentTaskKey!: string | null;

  @Column({
    name: 'supersedes_workflow_id',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  supersedesWorkflowId!: string | null;

  @Column({
    name: 'triggered_by_user_id',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  triggeredByUserId!: string | null;

  @Column({ name: 'schema_version', type: 'int', default: 1 })
  schemaVersion!: number;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  updatedAt!: Date;
}
