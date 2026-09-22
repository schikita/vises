import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlsSecretVault } from '../database/entities/bls-secret-vault.entity';
import { uid } from '../../shared/utils';
import { SecretsCryptoService } from './secrets-crypto.service';
import type {
  LoadBlsSecretInput,
  PersistBlsSecretInput,
} from './types/secret-envelope.types';

/**
 * Persist / load envelope-encrypted secrets via `bls_secret_vault` (DEC-005).
 * Ciphertext columns only; decrypt only for in-memory caller use.
 * Never logs plaintext, DEK, or tokens.
 */
@Injectable()
export class BlsSecretVaultService {
  constructor(
    @InjectRepository(BlsSecretVault)
    private readonly vaultRepo: Repository<BlsSecretVault>,
    private readonly crypto: SecretsCryptoService,
  ) {}

  /**
   * Encrypt `plain` and upsert by `(workflowId, purpose)`.
   * Rotating an existing purpose updates ciphertext and `rotatedAt`.
   */
  async persistSecret(input: PersistBlsSecretInput): Promise<BlsSecretVault> {
    const envelope = await this.crypto.encryptSecret(input.plain);
    const existing = await this.vaultRepo.findOne({
      where: {
        workflowId: input.workflowId,
        purpose: input.purpose,
      },
    });
    const now = new Date();
    if (existing) {
      existing.applicationId = input.applicationId;
      existing.ciphertext = envelope.ciphertext;
      existing.nonce = envelope.nonce;
      existing.wrappedDek = envelope.wrappedDek;
      existing.keyVersion = envelope.keyVersion;
      existing.rotatedAt = now;
      return this.vaultRepo.save(existing);
    }
    const row = this.vaultRepo.create({
      id: uid('bls-sec'),
      workflowId: input.workflowId,
      applicationId: input.applicationId,
      purpose: input.purpose,
      ciphertext: envelope.ciphertext,
      nonce: envelope.nonce,
      wrappedDek: envelope.wrappedDek,
      keyVersion: envelope.keyVersion,
      createdAt: now,
      rotatedAt: null,
    });
    return this.vaultRepo.save(row);
  }

  /**
   * Load vault row and decrypt to plaintext (in-memory).
   * Returns `null` when no row exists for `(workflowId, purpose)`.
   */
  async loadSecretPlain(input: LoadBlsSecretInput): Promise<string | null> {
    const row = await this.vaultRepo.findOne({
      where: {
        workflowId: input.workflowId,
        purpose: input.purpose,
      },
    });
    if (!row) {
      return null;
    }
    return this.crypto.decryptSecret({
      ciphertext: row.ciphertext,
      nonce: row.nonce,
      wrappedDek: row.wrappedDek,
      keyVersion: row.keyVersion,
    });
  }

  /**
   * Load + decrypt or throw NotFound when missing.
   * Prefer `loadSecretPlain` when absence is a normal branch.
   */
  async requireSecretPlain(input: LoadBlsSecretInput): Promise<string> {
    const plain = await this.loadSecretPlain(input);
    if (plain === null) {
      throw new NotFoundException('Secret not found in vault');
    }
    return plain;
  }

  /**
   * Hard-delete all vault rows for a workflow (terminal cleanup, REQ-016).
   * Returns number of rows removed. Never logs plaintext.
   */
  async purgeSecretsForWorkflow(workflowId: string): Promise<number> {
    const id = workflowId.trim();
    if (!id) {
      return 0;
    }
    const result = await this.vaultRepo.delete({ workflowId: id });
    return result.affected ?? 0;
  }
}
