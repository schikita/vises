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

  /**
   * Scraped/normalized Manage Applicants status (DEC-003).
   * Values: FORM_FILLING_IN_PROGRESS | READY_TO_BOOK | UNKNOWN.
   * Null = resume-from-scrape (compatible with pre-checkpoint rows).
   */
  @Column({
    name: 'portal_status',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  portalStatus!: string | null;

  /**
   * Checkpoint bag without raw field values or secrets (DEC-003 / NFR-007).
   * Null = resume-from-scrape.
   */
  @Column({
    name: 'portal_checkpoint_json',
    type: 'jsonb',
    nullable: true,
  })
  portalCheckpointJson!: Record<string, unknown> | null;
}
