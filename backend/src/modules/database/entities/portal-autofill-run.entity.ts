import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Durable portal autofill run + evidence metadata (DEC-001).
 * PNG bytes live on filesystem; this row stores metadata, checkpoints, and lock lease.
 * Legacy evidence-only rows may have `status` null — treat as terminal for list (DEC-011).
 * `field_progress_json` shape is owned by portal-scrape types (REQ-005) — no feature import here.
 */
@Entity({ name: 'portal_autofill_runs' })
export class PortalAutofillRun {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Index()
  @Column({ name: 'application_id', type: 'varchar', length: 40 })
  applicationId!: string;

  @Index()
  @Column({ name: 'applicant_id', type: 'varchar', length: 40 })
  applicantId!: string;

  @Column({
    name: 'screenshot_relative_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  screenshotRelativePath!: string | null;

  @Column({ name: 'capture_status', type: 'varchar', length: 32 })
  captureStatus!: string;

  @Column({ name: 'report_ok', type: 'boolean' })
  reportOk!: boolean;

  @Column({
    name: 'triggered_by_user_id',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  triggeredByUserId!: string | null;

  @Column({
    name: 'error_note',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  errorNote!: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;

  /**
   * Lifecycle: `in_progress` | `succeeded` | `failed` | `abandoned`.
   * Null on legacy evidence-only rows (treat as terminal for list).
   */
  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  status!: string | null;

  @Column({
    name: 'pipeline_stage',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  pipelineStage!: string | null;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  updatedAt!: Date;

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

  @Column({ name: 'captcha_attempt', type: 'int', default: 0 })
  captchaAttempt!: number;

  @Column({
    name: 'captcha_budget_deadline_at',
    type: 'timestamptz',
    nullable: true,
  })
  captchaBudgetDeadlineAt!: Date | null;

  @Column({
    name: 'capmonster_cb_state',
    type: 'varchar',
    length: 16,
    nullable: true,
  })
  capmonsterCbState!: string | null;

  @Column({
    name: 'capmonster_cb_consecutive_failures',
    type: 'int',
    default: 0,
  })
  capmonsterCbConsecutiveFailures!: number;

  @Column({
    name: 'capmonster_cb_opened_at',
    type: 'timestamptz',
    nullable: true,
  })
  capmonsterCbOpenedAt!: Date | null;

  @Column({
    name: 'capmonster_permanent_failed',
    type: 'boolean',
    default: false,
  })
  capmonsterPermanentFailed!: boolean;

  /** Optional non-secret CapMonster task id; never store clientKey / images. */
  @Column({
    name: 'capmonster_inflight_task_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  capmonsterInflightTaskId!: string | null;

  /** Per-field status map without values (REQ-005 / REQ-013). */
  @Column({
    name: 'field_progress_json',
    type: 'jsonb',
    nullable: true,
  })
  fieldProgressJson!: Record<
    string,
    { status: string; reason?: string }
  > | null;

  @Column({
    name: 'terminal_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  terminalReason!: string | null;
}
