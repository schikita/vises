import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uid } from '../../shared/utils';
import { BlsSecretVault } from '../database/entities/bls-secret-vault.entity';
import { SecretsCryptoService } from './secrets-crypto.service';
import type {
  BlsSecretPurpose,
  LoadBlsSecretInput,
  PersistBlsSecretInput,
} from './types';

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
   * Application-wide fallback for engine-parallel workflows: resolve the most
   * recently rotated secret for the application across all its workflows
   * (e.g. a portal account registered by an earlier run of either engine),
   * then re-persist it under the calling workflow id so later per-workflow
   * lookups hit. Returns null when nothing exists for the application.
   */
  async loadOrAdoptSecretPlain(input: {
    workflowId: string;
    applicationId: string;
    purpose: BlsSecretPurpose;
  }): Promise<string | null> {
    const own = await this.loadSecretPlain({
      workflowId: input.workflowId,
      purpose: input.purpose,
    });
    if (own !== null) {
      return own;
    }
    const row = await this.vaultRepo.findOne({
      where: {
        applicationId: input.applicationId,
        purpose: input.purpose,
      },
      order: { rotatedAt: 'DESC', createdAt: 'DESC' },
    });
    if (!row) {
      return null;
    }
    const plain = await this.crypto.decryptSecret({
      ciphertext: row.ciphertext,
      nonce: row.nonce,
      wrappedDek: row.wrappedDek,
      keyVersion: row.keyVersion,
    });
    await this.persistSecret({
      workflowId: input.workflowId,
      applicationId: input.applicationId,
      purpose: input.purpose,
      plain,
    });
    return plain;
  }

  /**
   * Hard-delete all vault rows for a workflow (legacy full purge).
   * Unused by terminal/grace paths after portal-credential-reveal (DEC-005).
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

  /**
   * Hard-delete vault rows for selected purposes only (DEC-005).
   * Empty purposes → no-op 0. Never logs plaintext.
   */
  async purgeSecretsForWorkflowPurposes(
    workflowId: string,
    purposes: readonly string[],
  ): Promise<number> {
    const id = workflowId.trim();
    if (!id || purposes.length === 0) {
      return 0;
    }
    const result = await this.vaultRepo
      .createQueryBuilder()
      .delete()
      .from(BlsSecretVault)
      .where('workflow_id = :workflowId', { workflowId: id })
      .andWhere('purpose IN (:...purposes)', { purposes: [...purposes] })
      .execute();
    return result.affected ?? 0;
  }

  /**
   * True when any of the given purposes exist for the workflow (no decrypt).
   */
  async hasAnySecretPurpose(
    workflowId: string,
    purposes: readonly string[],
  ): Promise<boolean> {
    const id = workflowId.trim();
    if (!id || purposes.length === 0) {
      return false;
    }
    const count = await this.vaultRepo
      .createQueryBuilder('v')
      .where('v.workflow_id = :workflowId', { workflowId: id })
      .andWhere('v.purpose IN (:...purposes)', { purposes: [...purposes] })
      .getCount();
    return count > 0;
  }
}
