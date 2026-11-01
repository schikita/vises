import type { DataSource } from 'typeorm';
import { FULL_DB_RESET_TABLES } from '../constants/full-db-reset-tables.constants';

/**
 * Truncate all operational tables for FR-10 / AC-18 full reset.
 * Does not perform a backup. Operator must backup before calling.
 */
export const clearAllOperationalTables = async (
  dataSource: DataSource,
): Promise<void> => {
  const quoted = FULL_DB_RESET_TABLES.map((name) => `"${name}"`).join(', ');
  await dataSource.query(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`,
  );
};
