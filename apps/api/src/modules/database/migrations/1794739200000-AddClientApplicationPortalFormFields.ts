import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * APF-TASK-002 / DEC-005: additive portal-form columns on clients + applications.
 * All nullable — null = not collected. No defaults that invent portal content.
 * down drops columns only after confirming no consumers remain.
 */
export class AddClientApplicationPortalFormFields1794739200000
  implements MigrationInterface
{
  name = 'AddClientApplicationPortalFormFields1794739200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD COLUMN IF NOT EXISTS "visa_sub_type" character varying(120)
    `);

    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "home_address_line2" text
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "home_country" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "home_city" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "home_postal_code" character varying(40)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "employer_name" character varying(200)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "employer_phone" character varying(80)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "employer_address" text
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "occupation" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "previous_finger_print_status" character varying(40)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "previous_finger_print_date" character varying(20)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "bls_inviting_authority" character varying(40)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_authority_name" character varying(200)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_country" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_city" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_zip_code" character varying(40)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_address" text
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_email" character varying(200)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_no" character varying(80)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_fax_no" character varying(80)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_name" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_surname" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_country" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_city" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_zip_code" character varying(40)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_address" text
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_contact_no" character varying(80)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_email" character varying(200)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "inviting_contact_fax_no" character varying(80)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "cost_covered_by" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "means_of_support" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "member_state_second_destination" character varying(120)
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD COLUMN IF NOT EXISTS "portal_form_conditionals_json" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "portal_form_conditionals_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "member_state_second_destination"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "means_of_support"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "cost_covered_by"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_fax_no"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_email"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_contact_no"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_address"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_zip_code"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_city"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_country"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_surname"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_name"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_fax_no"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_contact_no"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_email"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_address"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_zip_code"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_city"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_country"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "inviting_authority_name"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "bls_inviting_authority"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "previous_finger_print_date"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "previous_finger_print_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "occupation"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "employer_address"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "employer_phone"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "employer_name"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "home_postal_code"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "home_city"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "home_country"
    `);
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN IF EXISTS "home_address_line2"
    `);

    await queryRunner.query(`
      ALTER TABLE "applications"
      DROP COLUMN IF EXISTS "visa_sub_type"
    `);
  }
}
