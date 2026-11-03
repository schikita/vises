import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { StaffRole } from '@vises/contracts';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 200, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 200, nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', length: 200, unique: true })
  login!: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 200 })
  passwordHash!: string;

  @Column({ name: 'invite_password', type: 'varchar', length: 200, default: '' })
  invitePassword!: string;

  /** Staff roles only: `superadmin` | `admin` | `agent` (FR-1). */
  @Column({ type: 'varchar', length: 20 })
  role!: StaffRole;

  /**
   * Agent monetary balance (decimal string). Null/0 for non-agents (FR-4).
   * Partial unique for at most one superadmin is enforced in SchemaBootstrap.
   */
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
    default: 0,
  })
  balance!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'invite_token', type: 'varchar', length: 80, unique: true })
  inviteToken!: string;

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
