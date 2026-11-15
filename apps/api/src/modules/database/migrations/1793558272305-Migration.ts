import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1793558272305 implements MigrationInterface {
    name = 'Migration1793558272305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" character varying(40) NOT NULL, "name" character varying(200) NOT NULL, "login" character varying(200) NOT NULL, "email" character varying(200) NOT NULL DEFAULT '', "password_hash" character varying(200) NOT NULL, "invite_password" character varying(200) NOT NULL DEFAULT '', "role" character varying(20) NOT NULL, "balance" numeric(14,2) DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "invite_token" character varying(80) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_e9b5df308f0139b808c6b6495cb" UNIQUE ("invite_token"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "applications" ("id" character varying(40) NOT NULL, "client_id" character varying(40) NOT NULL, "code" character varying(40) NOT NULL, "client_email" character varying(200) NOT NULL DEFAULT '', "portal_form_email" character varying(200), "status" character varying(20) NOT NULL DEFAULT 'drafting', "destination" character varying(80) NOT NULL DEFAULT '', "visa_type" character varying(80) NOT NULL DEFAULT '', "submit_country" character varying(80) NOT NULL DEFAULT '', "submit_city" character varying(80) NOT NULL DEFAULT '', "travel_date" character varying(20) NOT NULL DEFAULT '', "return_date" character varying(20) NOT NULL DEFAULT '', "comment" text NOT NULL DEFAULT '', "documents" jsonb NOT NULL DEFAULT '[]'::jsonb, "payment_amount" integer NOT NULL DEFAULT '180', "payment_paid" boolean NOT NULL DEFAULT false, "payment_note" character varying(300) NOT NULL DEFAULT '', "visit_date" character varying(20) NOT NULL DEFAULT '', "visit_time" character varying(20) NOT NULL DEFAULT '', "visit_place" character varying(200) NOT NULL DEFAULT '', "manager" character varying(200) NOT NULL DEFAULT '', "extras" jsonb NOT NULL DEFAULT '{}'::jsonb, "timeline" jsonb NOT NULL DEFAULT '[]'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`);
        // Non-unique: 1 Client : N Applications (DEC-PF-011).
        await queryRunner.query(`CREATE INDEX "IDX_19b187ccdbeb753c44a3a0be30" ON "applications"  ("client_id") `);
        await queryRunner.query(`CREATE TABLE "settings" ("id" integer NOT NULL, "company" character varying(200) NOT NULL DEFAULT 'Vises', "default_price" integer NOT NULL DEFAULT '180', "cities" jsonb NOT NULL DEFAULT '[]'::jsonb, "destinations" jsonb NOT NULL DEFAULT '[]'::jsonb, "email_otp_enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" character varying(40) NOT NULL, "agent_id" character varying(40) NOT NULL, "email" character varying(200), "phone" character varying(80), "address" text, "purpose" character varying(200), "first_entry" character varying(80), "entries" character varying(80), "duration_days" character varying(40), "relationship" character varying(120), "passport_number" text, "passport_issued" text, "passport_expires" text, "passport_type" text, "passport_issue_country" text, "passport_issued_by" text, "first_name" text, "last_name" text, "last_name_at_birth" text, "dob" text, "place_of_birth" text, "country_of_birth" text, "nationality" text, "nationality_at_birth" text, "national_id" text, "other_names" text, "gender" text, "marital_status" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c65bbafdf6999275e2fd6a6745" ON "clients"  ("agent_id") `);
        await queryRunner.query(`CREATE TABLE "balance_transactions" ("id" character varying(40) NOT NULL, "agent_id" character varying(40) NOT NULL, "actor_id" character varying(40) NOT NULL, "type" character varying(40) NOT NULL, "amount" numeric(14,2) NOT NULL, "reason" text NOT NULL DEFAULT '', "resulting_balance" numeric(14,2) NOT NULL, "client_id" character varying(40), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_6aea2d6b103d342d343be2ae93c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3628c1308602aafa16c642f8c9" ON "balance_transactions"  ("agent_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_18d715a6c7d92e6dbe545c0952" ON "balance_transactions"  ("client_id") `);
        await queryRunner.query(`CREATE TABLE "application_status_history" ("id" character varying(40) NOT NULL, "application_id" character varying(40) NOT NULL, "from_status" character varying(32), "to_status" character varying(32) NOT NULL, "actor_id" character varying(40), "actor_role" character varying(40) NOT NULL, "trigger" character varying(200), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_62f7e8a5533a7db21218f2e2434" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a461ff43395424ebd6e218deb3" ON "application_status_history"  ("application_id") `);
        await queryRunner.query(`CREATE TABLE "portal_autofill_runs" ("id" character varying(40) NOT NULL, "application_id" character varying(40) NOT NULL, "applicant_id" character varying(40) NOT NULL, "screenshot_relative_path" character varying(500), "capture_status" character varying(32) NOT NULL, "report_ok" boolean NOT NULL, "triggered_by_user_id" character varying(40), "error_note" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "status" character varying(32), "pipeline_stage" character varying(64), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "lock_owner" character varying(64), "lock_heartbeat_at" TIMESTAMP WITH TIME ZONE, "captcha_attempt" integer NOT NULL DEFAULT '0', "captcha_budget_deadline_at" TIMESTAMP WITH TIME ZONE, "capmonster_cb_state" character varying(16), "capmonster_cb_consecutive_failures" integer NOT NULL DEFAULT '0', "capmonster_cb_opened_at" TIMESTAMP WITH TIME ZONE, "capmonster_permanent_failed" boolean NOT NULL DEFAULT false, "capmonster_inflight_task_id" character varying(64), "field_progress_json" jsonb, "terminal_reason" character varying(500), CONSTRAINT "PK_b6c3a8316c010b334fe984ad95c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6595b15b92b6757975404bc6b2" ON "portal_autofill_runs"  ("application_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_57d3c5d1cb69e88ab3261abe0d" ON "portal_autofill_runs"  ("applicant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_348accf8512130d06965d13dce" ON "portal_autofill_runs"  ("status") `);
        await queryRunner.query(`CREATE TABLE "proxy6_proxies" ("id" character varying(40) NOT NULL, "host" character varying(255) NOT NULL, "port" integer NOT NULL, "username" character varying(120) NOT NULL, "password" character varying(120) NOT NULL, "proxy_type" character varying(16) NOT NULL DEFAULT 'auto', "country" character varying(8), "version" integer NOT NULL DEFAULT '4', "period_days" integer NOT NULL DEFAULT '0', "date" TIMESTAMP WITH TIME ZONE, "date_end" TIMESTAMP WITH TIME ZONE NOT NULL, "active" boolean NOT NULL DEFAULT true, "descr" character varying(50) NOT NULL DEFAULT '', "in_use" boolean NOT NULL DEFAULT false, "lease_token" character varying(64), "leased_at" TIMESTAMP WITH TIME ZONE, "lease_expires_at" TIMESTAMP WITH TIME ZONE, "last_leased_at" TIMESTAMP WITH TIME ZONE, "lease_count" integer NOT NULL DEFAULT '0', "synced_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_146294e1f759de42a664523d5bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bls_workflows" ("id" character varying(40) NOT NULL, "application_id" character varying(40) NOT NULL, "status" character varying(32) NOT NULL, "terminal_reason" character varying(500), "next_run_at" TIMESTAMP WITH TIME ZONE, "lock_owner" character varying(64), "lock_heartbeat_at" TIMESTAMP WITH TIME ZONE, "current_step_key" character varying(64), "current_task_key" character varying(64), "supersedes_workflow_id" character varying(40), "mailbox_cleanup_due_at" TIMESTAMP WITH TIME ZONE, "triggered_by_user_id" character varying(40), "schema_version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_bb28de4997de535db18a5dd3cf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a6c7232adb5c5e7fa352cd8bfa" ON "bls_workflows"  ("lock_heartbeat_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_2be811fd4465e5dd69dc095ecb" ON "bls_workflows"  ("application_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_632cc82fe296cef31343e5c140" ON "bls_workflows"  ("status", "next_run_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_75e9e9dede0f7c54b4296673b0" ON "bls_workflows"  ("application_id") `);
        await queryRunner.query(`CREATE TABLE "bls_workflow_steps" ("id" character varying(40) NOT NULL, "workflow_id" character varying(40) NOT NULL, "step_key" character varying(32) NOT NULL, "ordinal" integer NOT NULL, "status" character varying(32) NOT NULL, "skip_reason" character varying(500), "portal_autofill_run_id" character varying(40), "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_6198447530d118db91f30dac62d" UNIQUE ("workflow_id", "step_key"), CONSTRAINT "PK_563b279cda3274c564df154c879" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5c5c7d3aa80eeaa230981d6498" ON "bls_workflow_steps"  ("workflow_id", "ordinal") `);
        await queryRunner.query(`CREATE INDEX "IDX_d05b19c484ecd0c2f61d568186" ON "bls_workflow_steps"  ("workflow_id") `);
        await queryRunner.query(`CREATE TABLE "bls_workflow_tasks" ("id" character varying(40) NOT NULL, "step_id" character varying(40) NOT NULL, "task_key" character varying(64) NOT NULL, "applicant_id" character varying(40), "ordinal" integer NOT NULL, "status" character varying(32) NOT NULL, "attempt_count" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '5', "last_error_class" character varying(32), "last_error_code" character varying(64), "last_error_message" character varying(500), "next_run_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_462c24c4e091b095b0bd278fa22" UNIQUE ("step_id", "ordinal"), CONSTRAINT "PK_c2f97e1b858b9cd0e230abdeac8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d03322df04d933f16fc7a21e04" ON "bls_workflow_tasks"  ("step_id") `);
        await queryRunner.query(`CREATE TABLE "bls_workflow_attempts" ("id" character varying(40) NOT NULL, "task_id" character varying(40) NOT NULL, "attempt_no" integer NOT NULL, "outcome" character varying(32) NOT NULL, "error_class" character varying(32), "error_code" character varying(64), "error_message" character varying(500), "evidence_relative_path" character varying(500), "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_754c0389b9b91c4b35cad64bb32" UNIQUE ("task_id", "attempt_no"), CONSTRAINT "PK_b26f48f40b34f6ff32f7ff59960" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ed252efeade44657e16ef81d1" ON "bls_workflow_attempts"  ("task_id", "started_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0845c943f99877cac5f45df42" ON "bls_workflow_attempts"  ("task_id") `);
        await queryRunner.query(`CREATE TABLE "bls_workflow_events" ("id" BIGSERIAL NOT NULL, "workflow_id" character varying(40) NOT NULL, "event_type" character varying(64) NOT NULL, "step_key" character varying(32), "task_key" character varying(64), "payload_safe" jsonb NOT NULL DEFAULT '{}'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_8f1ec10e9bded1922b82dbd0d2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_81d4da402149eb012449abcf51" ON "bls_workflow_events"  ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_3edbdf7327aa3c3b9732104bc2" ON "bls_workflow_events"  ("workflow_id", "id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7fcc296dfbfc9cce487c2f5ce6" ON "bls_workflow_events"  ("workflow_id") `);
        await queryRunner.query(`CREATE TABLE "bls_secret_vault" ("id" character varying(40) NOT NULL, "workflow_id" character varying(40) NOT NULL, "application_id" character varying(40) NOT NULL, "purpose" character varying(32) NOT NULL, "ciphertext" bytea NOT NULL, "nonce" bytea NOT NULL, "wrapped_dek" bytea NOT NULL, "key_version" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "rotated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_d13f997558b457080aa9ed6396c" UNIQUE ("workflow_id", "purpose"), CONSTRAINT "PK_5589a98a0bfb01e5b04620ac6af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a2e2a3fd57104e5b0d901dd1bf" ON "bls_secret_vault"  ("application_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f8bba8bce67c868c86da49d398" ON "bls_secret_vault"  ("workflow_id") `);
        await queryRunner.query(`DROP INDEX "public"."IDX_2be811fd4465e5dd69dc095ecb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ed252efeade44657e16ef81d1"`);
        await queryRunner.query(`CREATE INDEX "IDX_2be811fd4465e5dd69dc095ecb" ON "bls_workflows"  ("application_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_0ed252efeade44657e16ef81d1" ON "bls_workflow_attempts"  ("task_id", "started_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0ed252efeade44657e16ef81d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2be811fd4465e5dd69dc095ecb"`);
        await queryRunner.query(`CREATE INDEX "IDX_0ed252efeade44657e16ef81d1" ON "bls_workflow_attempts"  ("task_id", "started_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_2be811fd4465e5dd69dc095ecb" ON "bls_workflows"  ("application_id", "created_at") `);
        await queryRunner.query(`DROP INDEX "public"."IDX_f8bba8bce67c868c86da49d398"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2e2a3fd57104e5b0d901dd1bf"`);
        await queryRunner.query(`DROP TABLE "bls_secret_vault"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7fcc296dfbfc9cce487c2f5ce6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3edbdf7327aa3c3b9732104bc2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81d4da402149eb012449abcf51"`);
        await queryRunner.query(`DROP TABLE "bls_workflow_events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0845c943f99877cac5f45df42"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ed252efeade44657e16ef81d1"`);
        await queryRunner.query(`DROP TABLE "bls_workflow_attempts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d03322df04d933f16fc7a21e04"`);
        await queryRunner.query(`DROP TABLE "bls_workflow_tasks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d05b19c484ecd0c2f61d568186"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5c5c7d3aa80eeaa230981d6498"`);
        await queryRunner.query(`DROP TABLE "bls_workflow_steps"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75e9e9dede0f7c54b4296673b0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_632cc82fe296cef31343e5c140"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2be811fd4465e5dd69dc095ecb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6c7232adb5c5e7fa352cd8bfa"`);
        await queryRunner.query(`DROP TABLE "bls_workflows"`);
        await queryRunner.query(`DROP TABLE "proxy6_proxies"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_348accf8512130d06965d13dce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57d3c5d1cb69e88ab3261abe0d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6595b15b92b6757975404bc6b2"`);
        await queryRunner.query(`DROP TABLE "portal_autofill_runs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a461ff43395424ebd6e218deb3"`);
        await queryRunner.query(`DROP TABLE "application_status_history"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_18d715a6c7d92e6dbe545c0952"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3628c1308602aafa16c642f8c9"`);
        await queryRunner.query(`DROP TABLE "balance_transactions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c65bbafdf6999275e2fd6a6745"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_19b187ccdbeb753c44a3a0be30"`);
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
