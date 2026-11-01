import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { ApplicationStatus } from '@vises/contracts';

/**
 * Append-only application status history (FR-7 / AC-12 / NFR-4).
 * Analytics read this table; operational lists use mutable Application.status.
 */
@Entity({ name: 'application_status_history' })
export class ApplicationStatusHistory {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Index()
  @Column({ name: 'application_id', type: 'varchar', length: 40 })
  applicationId!: string;

  @Column({ name: 'from_status', type: 'varchar', length: 32, nullable: true })
  fromStatus!: ApplicationStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 32 })
  toStatus!: ApplicationStatus;

  /** Staff user id, or null when actor is a system identity. */
  @Column({ name: 'actor_id', type: 'varchar', length: 40, nullable: true })
  actorId!: string | null;

  /**
   * StaffRole or system identity (`visa_center_monitor`).
   * Kept as string so monitor actor is representable without widening StaffRole.
   */
  @Column({ name: 'actor_role', type: 'varchar', length: 40 })
  actorRole!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  trigger!: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;
}
