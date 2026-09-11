import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  login!: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 200 })
  passwordHash!: string;

  @Column({ name: 'invite_password', type: 'varchar', length: 200, default: '' })
  invitePassword!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: string;

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
