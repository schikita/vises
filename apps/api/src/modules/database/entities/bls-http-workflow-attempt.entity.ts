import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';

/**
 * One execution try for a task (REQ-004). Never store secrets / field values.
 */
@Entity({ name: 'bls_http_workflow_attempts' })
@Unique(['taskId', 'attemptNo'])
@Index(['taskId'])
@Index(['taskId', 'startedAt'])
export class BlsHttpWorkflowAttempt {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ name: 'task_id', type: 'varchar', length: 40 })
  taskId!: string;

  @Column({ name: 'attempt_no', type: 'int' })
  attemptNo!: number;

  @Column({ type: 'varchar', length: 32 })
  outcome!: string;

  @Column({
    name: 'error_class',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  errorClass!: string | null;

  @Column({
    name: 'error_code',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  errorCode!: string | null;

  @Column({
    name: 'error_message',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  errorMessage!: string | null;

  @Column({
    name: 'evidence_relative_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  evidenceRelativePath!: string | null;

  @Column({
    name: 'started_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  startedAt!: Date;

  @Column({
    name: 'finished_at',
    type: 'timestamptz',
    nullable: true,
  })
  finishedAt!: Date | null;
}
