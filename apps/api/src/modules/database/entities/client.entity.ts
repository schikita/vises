import type { ClientPortalFormConditionals } from '@vises/contracts';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Client owned by an agent (FR-5 / FR-6).
 * Passport PII columns store AES-256-GCM ciphertext (`iv:authTag:ciphertext`)
 * or null; encryption/decryption lives in `modules/pii` (T3).
 * Portal form happy-path columns are plaintext nullable (APF / DEC-002).
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

  /** Portal form plaintext (APF-TASK-002 / DEC-002) — null = not collected. */
  @Column({ name: 'home_address_line2', type: 'text', nullable: true })
  homeAddressLine2!: string | null;

  @Column({ name: 'home_country', type: 'varchar', length: 120, nullable: true })
  homeCountry!: string | null;

  @Column({ name: 'home_city', type: 'varchar', length: 120, nullable: true })
  homeCity!: string | null;

  @Column({
    name: 'home_postal_code',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  homePostalCode!: string | null;

  @Column({ name: 'employer_name', type: 'varchar', length: 200, nullable: true })
  employerName!: string | null;

  @Column({
    name: 'employer_phone',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  employerPhone!: string | null;

  @Column({ name: 'employer_address', type: 'text', nullable: true })
  employerAddress!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  occupation!: string | null;

  @Column({
    name: 'previous_finger_print_status',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  previousFingerPrintStatus!: string | null;

  @Column({
    name: 'previous_finger_print_date',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  previousFingerPrintDate!: string | null;

  @Column({
    name: 'bls_inviting_authority',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  blsInvitingAuthority!: string | null;

  @Column({
    name: 'inviting_authority_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  invitingAuthorityName!: string | null;

  @Column({
    name: 'inviting_country',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  invitingCountry!: string | null;

  @Column({
    name: 'inviting_city',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  invitingCity!: string | null;

  @Column({
    name: 'inviting_zip_code',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  invitingZipCode!: string | null;

  @Column({ name: 'inviting_address', type: 'text', nullable: true })
  invitingAddress!: string | null;

  @Column({
    name: 'inviting_email',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  invitingEmail!: string | null;

  @Column({
    name: 'inviting_contact_no',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  invitingContactNo!: string | null;

  @Column({
    name: 'inviting_fax_no',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  invitingFaxNo!: string | null;

  @Column({
    name: 'inviting_contact_name',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  invitingContactName!: string | null;

  @Column({
    name: 'inviting_contact_surname',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  invitingContactSurname!: string | null;

  @Column({
    name: 'inviting_contact_country',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  invitingContactCountry!: string | null;

  @Column({
    name: 'inviting_contact_city',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  invitingContactCity!: string | null;

  @Column({
    name: 'inviting_contact_zip_code',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  invitingContactZipCode!: string | null;

  @Column({ name: 'inviting_contact_address', type: 'text', nullable: true })
  invitingContactAddress!: string | null;

  @Column({
    name: 'inviting_contact_contact_no',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  invitingContactContactNo!: string | null;

  @Column({
    name: 'inviting_contact_email',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  invitingContactEmail!: string | null;

  @Column({
    name: 'inviting_contact_fax_no',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  invitingContactFaxNo!: string | null;

  @Column({
    name: 'cost_covered_by',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  costCoveredBy!: string | null;

  @Column({
    name: 'means_of_support',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  meansOfSupport!: string | null;

  @Column({
    name: 'member_state_second_destination',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  memberStateSecondDestination!: string | null;

  @Column({
    name: 'portal_form_conditionals_json',
    type: 'jsonb',
    nullable: true,
  })
  portalFormConditionals!: ClientPortalFormConditionals | null;

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
