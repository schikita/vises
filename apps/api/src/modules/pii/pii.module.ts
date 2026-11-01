import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../database/entities/client.entity';
import { PiiAuditService } from './pii-audit.service';
import { PiiCryptoService } from './pii-crypto.service';
import { PiiRetentionJob } from './pii-retention.job';

/**
 * Passport PII AES-256-GCM crypto, Winston read audit, and retention (FR-6).
 * Leaf feature module (mirror `bls-secrets`); TypeORM `Client` only.
 * Pure AES helpers live in `src/shared/utils` (no DB / Winston / entities).
 */
@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Client])],
  providers: [PiiAuditService, PiiCryptoService, PiiRetentionJob],
  exports: [PiiCryptoService, PiiAuditService],
})
export class PiiModule {}
