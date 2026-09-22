import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';

/**
 * Sequential task within a step (per-applicant under STATUS_VALIDATE / BOOK).
 */
@Entity({ name: 'bls_workflow_tasks' })
@Unique(['stepId', 'ordinal'])
@Index(['stepId'])
export class BlsWorkflowTask {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ name: 'step_id', type: 'varchar', length: 40 })
  stepId!: string;

  @Column({ name: 'task_key', type: 'varchar', length: 64 })
  taskKey!: string;

  @Column({
    name: 'applicant_id',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  applicantId!: string | null;

  @Column({ type: 'int' })
  ordinal!: number;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'attempt_count', type: 'int', default: 0 })
  attemptCount!: number;

  @Column({ name: 'max_attempts', type: 'int', default: 5 })
  maxAttempts!: number;

  @Column({
    name: 'last_error_class',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  lastErrorClass!: string | null;

  @Column({
    name: 'last_error_code',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  lastErrorCode!: string | null;

  @Column({
    name: 'last_error_message',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  lastErrorMessage!: string | null;

  @Column({
    name: 'next_run_at',
    type: 'timestamptz',
    nullable: true,
  })
  nextRunAt!: Date | null;
}
