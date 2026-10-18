import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';

/**
 * Envelope-encrypted portal / mailbox secrets (DEC-005).
 * Ciphertext columns only — never plaintext passwords / tokens.
 */
@Entity({ name: 'bls_secret_vault' })
@Unique(['workflowId', 'purpose'])
@Index(['workflowId'])
@Index(['applicationId'])
export class BlsSecretVault {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ name: 'workflow_id', type: 'varchar', length: 40 })
  workflowId!: string;

  @Column({ name: 'application_id', type: 'varchar', length: 40 })
  applicationId!: string;

  @Column({ type: 'varchar', length: 32 })
  purpose!: string;

  @Column({ type: 'bytea' })
  ciphertext!: Buffer;

  @Column({ type: 'bytea' })
  nonce!: Buffer;

  @Column({ name: 'wrapped_dek', type: 'bytea' })
  wrappedDek!: Buffer;

  @Column({ name: 'key_version', type: 'int' })
  keyVersion!: number;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt!: Date;

  @Column({
    name: 'rotated_at',
    type: 'timestamptz',
    nullable: true,
  })
  rotatedAt!: Date | null;
}
