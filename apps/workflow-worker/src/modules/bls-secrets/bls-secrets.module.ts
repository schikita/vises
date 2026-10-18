import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlsSecretVault } from '../database/entities/bls-secret-vault.entity';
import { BlsSecretVaultService } from './bls-secret-vault.service';
import { SecretsCryptoService } from './secrets-crypto.service';

/**
 * Envelope crypto + BLS secret vault (portal-scrape-module-split DEC-001 / REQ-012).
 * Leaf vs portal feature modules; TypeORM BlsSecretVault only.
 */
@Module({
  imports: [TypeOrmModule.forFeature([BlsSecretVault])],
  providers: [SecretsCryptoService, BlsSecretVaultService],
  exports: [SecretsCryptoService, BlsSecretVaultService],
})
export class BlsSecretsModule {}
