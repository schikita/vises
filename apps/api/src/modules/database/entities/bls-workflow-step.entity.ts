import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';

/**
 * Ordered workflow step (REGISTER…BOOK). Nullable soft link to
 * `portal_autofill_runs` for REGISTER evidence only — not SoT (DEC-012).
 */
@Entity({ name: 'bls_workflow_steps' })
@Unique(['workflowId', 'stepKey'])
@Index(['workflowId'])
@Index(['workflowId', 'ordinal'])
export class BlsWorkflowStep {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ name: 'workflow_id', type: 'varchar', length: 40 })
  workflowId!: string;

  @Column({ name: 'step_key', type: 'varchar', length: 32 })
  stepKey!: string;

  @Column({ type: 'int' })
  ordinal!: number;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({
    name: 'skip_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  skipReason!: string | null;

  /** Soft link to legacy RegisterUser run; no hard DB FK (DEC-012). */
  @Column({
    name: 'portal_autofill_run_id',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  portalAutofillRunId!: string | null;

  @Column({
    name: 'started_at',
    type: 'timestamptz',
    nullable: true,
  })
  startedAt!: Date | null;

  @Column({
    name: 'completed_at',
    type: 'timestamptz',
    nullable: true,
  })
  completedAt!: Date | null;
}
