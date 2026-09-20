import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'settings' })
export class Setting {
  @PrimaryColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 200, default: 'Vises' })
  company!: string;

  @Column({ name: 'default_price', type: 'int', default: 180 })
  defaultPrice!: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  cities!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  destinations!: string[];

  /** Admin toggle: lease Webshare proxies for portal autofill browser egress. */
  @Column({ name: 'webshare_proxy_enabled', type: 'boolean', default: false })
  webshareProxyEnabled!: boolean;

  /** Optional Webshare plan_id for Proxy List; empty ⇒ account default plan. */
  @Column({ name: 'webshare_plan_id', type: 'varchar', length: 120, default: '' })
  websharePlanId!: string;

  /** Admin toggle: Mail.tm disposable email OTP for portal autofill. */
  @Column({ name: 'email_otp_enabled', type: 'boolean', default: false })
  emailOtpEnabled!: boolean;
}
