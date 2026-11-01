import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Client owned by an agent (FR-5 / FR-6).
 * Passport PII columns store AES-256-GCM ciphertext (`iv:authTag:ciphertext`)
 * or null; encryption/decryption lives in `modules/pii` (T3).
 */
@Entity({ name: 'clients' })
export class Client {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Index()
  @Column({ name: 'agent_id', type: 'varchar', length: 40 })
  agentId!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  purpose!: string | null;

  @Column({ name: 'first_entry', type: 'varchar', length: 80, nullable: true })
  firstEntry!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  entries!: string | null;

  @Column({
    name: 'duration_days',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  durationDays!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  relationship!: string | null;

  /** FR-6 encrypted set — ciphertext or null. */
  @Column({ name: 'passport_number', type: 'text', nullable: true })
  passportNumber!: string | null;

  @Column({ name: 'passport_issued', type: 'text', nullable: true })
  passportIssued!: string | null;

  @Column({ name: 'passport_expires', type: 'text', nullable: true })
  passportExpires!: string | null;

  @Column({ name: 'passport_type', type: 'text', nullable: true })
  passportType!: string | null;

  @Column({ name: 'passport_issue_country', type: 'text', nullable: true })
  passportIssueCountry!: string | null;

  @Column({ name: 'passport_issued_by', type: 'text', nullable: true })
  passportIssuedBy!: string | null;

  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName!: string | null;

  @Column({ name: 'last_name_at_birth', type: 'text', nullable: true })
  lastNameAtBirth!: string | null;

  @Column({ type: 'text', nullable: true })
  dob!: string | null;

  @Column({ name: 'place_of_birth', type: 'text', nullable: true })
  placeOfBirth!: string | null;

  @Column({ name: 'country_of_birth', type: 'text', nullable: true })
  countryOfBirth!: string | null;

  @Column({ type: 'text', nullable: true })
  nationality!: string | null;

  @Column({ name: 'nationality_at_birth', type: 'text', nullable: true })
  nationalityAtBirth!: string | null;

  @Column({ name: 'national_id', type: 'text', nullable: true })
  nationalId!: string | null;

  @Column({ name: 'other_names', type: 'text', nullable: true })
  otherNames!: string | null;

  @Column({ type: 'text', nullable: true })
  gender!: string | null;

  @Column({ name: 'marital_status', type: 'text', nullable: true })
  maritalStatus!: string | null;

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
