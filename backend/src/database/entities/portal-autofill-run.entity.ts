import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Durable portal autofill evidence run (DEC-001).
 * PNG bytes live on filesystem; this row stores metadata + relative path.
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
}
