import { MigrationInterface, QueryRunner } from 'typeorm';
import { uid } from '../../../shared/utils';
import {
  APPLICATION_STATUS_VARCHAR_LENGTH,
  LEGACY_BUSINESS_STATUS_MIGRATION_ACTOR_ROLE,
  LEGACY_BUSINESS_STATUS_MIGRATION_TRIGGER,
} from '../../apps/utils/map-legacy-application-status-to-business.constants';
import { mapLegacyApplicationStatusToBusiness } from '../../apps/utils/map-legacy-application-status-to-business.util';

type ApplicationStatusRow = {
  id: string;
  status: string;
};

type HistoryStatusRow = {
  id: string;
  from_status: string | null;
  to_status: string;
};

/**
 * ASAU-004 / §4.D — widen applications.status, rewrite app + history statuses
 * via the legacy→BUSINESS map, append one system audit row per application.
 * Gate in 04-plan.md remains PENDING — do not run until CLEARED.
 */
export class MigrateApplicationStatusToBusiness1794902400000
  implements MigrationInterface
{
  name = 'MigrateApplicationStatusToBusiness1794902400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications"
      ALTER COLUMN "status" TYPE character varying(${APPLICATION_STATUS_VARCHAR_LENGTH})
    `);

    await queryRunner.query(`
      ALTER TABLE "applications"
      ALTER COLUMN "status" SET DEFAULT 'draft'
    `);

    const applications: ApplicationStatusRow[] = await queryRunner.query(`
      SELECT "id", "status" FROM "applications"
    `);

    for (const row of applications) {
      const mapped = mapLegacyApplicationStatusToBusiness(row.status);
      if (mapped !== row.status) {
        await queryRunner.query(
          `
            UPDATE "applications"
            SET "status" = $1, "updated_at" = NOW()
            WHERE "id" = $2
          `,
          [mapped, row.id],
        );
      }
    }

    const historyRows: HistoryStatusRow[] = await queryRunner.query(`
      SELECT "id", "from_status", "to_status" FROM "application_status_history"
    `);

    for (const row of historyRows) {
      const mappedFrom =
        row.from_status === null
          ? null
          : mapLegacyApplicationStatusToBusiness(row.from_status);
      const mappedTo = mapLegacyApplicationStatusToBusiness(row.to_status);

      if (mappedFrom !== row.from_status || mappedTo !== row.to_status) {
        await queryRunner.query(
          `
            UPDATE "application_status_history"
            SET "from_status" = $1, "to_status" = $2
            WHERE "id" = $3
          `,
          [mappedFrom, mappedTo, row.id],
        );
      }
    }

    const migratedApps: ApplicationStatusRow[] = await queryRunner.query(`
      SELECT "id", "status" FROM "applications"
    `);

    for (const row of migratedApps) {
      const businessStatus = mapLegacyApplicationStatusToBusiness(row.status);
      await queryRunner.query(
        `
          INSERT INTO "application_status_history"
            ("id", "application_id", "from_status", "to_status", "actor_id", "actor_role", "trigger", "created_at")
          VALUES
            ($1, $2, $3, $4, NULL, $5, $6, NOW())
        `,
        [
          uid('ash'),
          row.id,
          businessStatus,
          businessStatus,
          LEGACY_BUSINESS_STATUS_MIGRATION_ACTOR_ROLE,
          LEGACY_BUSINESS_STATUS_MIGRATION_TRIGGER,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM "application_status_history"
        WHERE "trigger" = $1
      `,
      [LEGACY_BUSINESS_STATUS_MIGRATION_TRIGGER],
    );

    // Status rewrites are lossy (many legacy → one BUSINESS); leave BUSINESS
    // values in place. Do not shrink varchar(32)→varchar(20): BUSINESS ids
    // `ready_for_appointment` / `not_ready_for_appointment` exceed 20.
    await queryRunner.query(`
      ALTER TABLE "applications"
      ALTER COLUMN "status" SET DEFAULT 'draft'
    `);
  }
}
