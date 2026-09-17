import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * DEC-003: after TypeORM synchronize, ensure legacy `extras` column.
 * Seed-if-empty runs in SeedService.onModuleInit (keeps database ↔ seed imports one-way).
 */
@Injectable()
export class SchemaBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SchemaBootstrap.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.dataSource.query(
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '{}'::jsonb`,
    );
    this.logger.log('Schema ensure: applications.extras column OK');
  }
}
