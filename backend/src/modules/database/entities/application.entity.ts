import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'applications' })
export class Application {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ type: 'varchar', length: 40 })
  code!: string;

  @Column({ name: 'client_email', type: 'varchar', length: 200 })
  clientEmail!: string;

  @Column({ type: 'varchar', length: 20, default: 'new' })
  status!: string;

  @Column({ type: 'varchar', length: 80, default: '' })
  destination!: string;

  @Column({ name: 'visa_type', type: 'varchar', length: 80, default: '' })
  visaType!: string;

  @Column({ name: 'submit_country', type: 'varchar', length: 80, default: '' })
  submitCountry!: string;

  @Column({ name: 'submit_city', type: 'varchar', length: 80, default: '' })
  submitCity!: string;

  @Column({ name: 'travel_date', type: 'varchar', length: 20, default: '' })
  travelDate!: string;

  @Column({ name: 'return_date', type: 'varchar', length: 20, default: '' })
  returnDate!: string;

  @Column({ type: 'text', default: '' })
  comment!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  applicants!: unknown[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  documents!: unknown[];

  @Column({ name: 'payment_amount', type: 'int', default: 180 })
  paymentAmount!: number;

  @Column({ name: 'payment_paid', type: 'boolean', default: false })
  paymentPaid!: boolean;

  @Column({ name: 'payment_note', type: 'varchar', length: 300, default: '' })
  paymentNote!: string;

  @Column({ name: 'visit_date', type: 'varchar', length: 20, default: '' })
  visitDate!: string;

  @Column({ name: 'visit_time', type: 'varchar', length: 20, default: '' })
  visitTime!: string;

  @Column({ name: 'visit_place', type: 'varchar', length: 200, default: '' })
  visitPlace!: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  manager!: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  extras!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  timeline!: unknown[];

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
