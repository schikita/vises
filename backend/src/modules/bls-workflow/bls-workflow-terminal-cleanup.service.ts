import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { TEMPORARY_EMAIL_PROVIDER } from '../mailtm/constants/mailtm-di.tokens';
import type { TemporaryEmailProvider } from '../mailtm/interfaces/temporary-email-provider.interface';
import {
  BLS_SECRET_PURPOSE,
  BLS_SECRET_PURPOSE_MAILTM_CLEANUP,
  BLS_WORKFLOW_EVENT_RETENTION_PURGE_BATCH,
  BLS_WORKFLOW_MAILBOX_CLEANUP_PURGE_BATCH,
  BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES,
  BLS_WORKFLOW_TERMINAL_STATUSES,
} from './constants/bls-workflow.constants';
import { BlsSecretVaultService } from '../bls-secrets/bls-secret-vault.service';
import type {
  BlsWorkflowDueMailboxPurgeResult,
  BlsWorkflowEventsRetentionPurgeResult,
  BlsWorkflowTerminalCleanupInput,
  BlsWorkflowTerminalCleanupResult,
} from './types/bls-workflow-terminal-cleanup.types';
import { computeBlsWorkflowEventRetentionCutoff } from './utils/compute-bls-workflow-event-retention-cutoff.util';
import { computeBlsWorkflowMailboxCleanupDueAt } from './utils/compute-bls-workflow-mailbox-cleanup-due-at.util';
import { isBlsWorkflowMailboxCleanupEligible } from './utils/is-bls-workflow-mailbox-cleanup-eligible.util';
import { BlsWorkflowRepository } from './bls-workflow.repository';

/**
 * Deferred Mail.tm / MAILTM_* cleanup + events TTL
 * (portal-credential-reveal DEC-004 / DEC-005 / DEC-009 / DEC-010).
 * Terminal entry schedules due-at only — does not delete mailbox or purge vault.
 * Soft-fail throughout; never logs tokens, passwords, or DEK material.
 * Not invoked on REGISTER / OTP success alone.
 */
@Injectable()
export class BlsWorkflowTerminalCleanupService {
  private readonly logger = new Logger(BlsWorkflowTerminalCleanupService.name);

  constructor(
    private readonly workflows: BlsWorkflowRepository,
    private readonly secretVault: BlsSecretVaultService,
    @Inject(TEMPORARY_EMAIL_PROVIDER)
    private readonly mailProvider: TemporaryEmailProvider,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
  ) {}


  /**
   * After workflow reaches a mailbox-cleanup terminal status:
   * schedule mailboxCleanupDueAt = now + 72h when null (DEC-004).
   * Does not delete Mail.tm or purge any vault purposes (REQ-006 / REQ-009).
   * Never throws to callers.
   */
  async cleanupAfterTerminal(
    input: BlsWorkflowTerminalCleanupInput,
  ): Promise<BlsWorkflowTerminalCleanupResult> {
    const empty: BlsWorkflowTerminalCleanupResult = {
      scheduled: false,
      mailboxCleanupDueAt: null,
    };
    const workflowId = input.workflowId.trim();
    if (!workflowId) {
      return empty;
    }

    try {
      const workflow = await this.workflows.findById(workflowId);
      if (!workflow) {
        return empty;
      }
      if (!isBlsWorkflowMailboxCleanupEligible(workflow.status)) {
        this.logger.log(
          `bls_workflow_mailbox_cleanup_schedule skipped workflowId=${workflowId} status=${workflow.status}`,
        );
        return empty;
      }

      if (workflow.mailboxCleanupDueAt != null) {
        await this.mailProvider.disposeSession(workflowId).catch(() => undefined);
        this.logger.log(
          `bls_workflow_mailbox_cleanup_schedule already_set workflowId=${workflowId} dueAt=${workflow.mailboxCleanupDueAt.toISOString()}`,
        );
        return {
          scheduled: true,
          mailboxCleanupDueAt: workflow.mailboxCleanupDueAt.toISOString(),
        };
      }

      const dueAt = computeBlsWorkflowMailboxCleanupDueAt();
      workflow.mailboxCleanupDueAt = dueAt;
      workflow.updatedAt = new Date();
      await this.workflows.saveWorkflow(workflow);

      // Eager browser-session dispose (DEC-006); idempotent for API mode.
      await this.mailProvider.disposeSession(workflowId).catch(() => undefined);

      this.logger.log(
        `bls_workflow_mailbox_cleanup_scheduled workflowId=${workflowId} dueAt=${dueAt.toISOString()}`,
      );

      return {
        scheduled: true,
        mailboxCleanupDueAt: dueAt.toISOString(),
      };
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'cleanup_schedule_failed';
      this.logger.warn(
        `bls_workflow_mailbox_cleanup_schedule soft_fail workflowId=${workflowId} detail=${detail}`,
      );
      return empty;
    }
  }

  /**
   * Best-effort tick: soft-fail Mail.tm delete + MAILTM_* purge for due workflows;
   * optional orphan reconcile (DEC-010). Never throws. Never touches PORTAL_PASSWORD.
   */
  async purgeDueMailboxes(): Promise<BlsWorkflowDueMailboxPurgeResult> {
    const empty: BlsWorkflowDueMailboxPurgeResult = {
      processedCount: 0,
      mailboxesDeleted: 0,
      vaultRowsPurged: 0,
      orphansReconciled: 0,
    };
    try {
      const orphansReconciled = await this.reconcileOrphanMailboxCleanupDueAts();
      const due = await this.workflows.findDueMailboxCleanupWorkflows({
        statuses: BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES,
        now: new Date(),
        limit: BLS_WORKFLOW_MAILBOX_CLEANUP_PURGE_BATCH,
      });

      let mailboxesDeleted = 0;
      let vaultRowsPurged = 0;

      for (const workflow of due) {
        try {
          const mailbox = await this.deleteMailboxSoft(
            workflow.id,
            workflow.applicationId,
          );
          if (mailbox.deleted) {
            mailboxesDeleted += 1;
          }
          if (mailbox.warnMessage) {
            this.logger.warn(
              `bls_workflow_mailbox_due_purge workflowId=${workflow.id} ${mailbox.warnMessage}`,
            );
          }

          const purged = await this.secretVault.purgeSecretsForWorkflowPurposes(
            workflow.id,
            BLS_SECRET_PURPOSE_MAILTM_CLEANUP,
          );
          vaultRowsPurged += purged;

          workflow.mailboxCleanupDueAt = null;
          workflow.updatedAt = new Date();
          await this.workflows.saveWorkflow(workflow);

          this.logger.log(
            `bls_workflow_mailbox_due_purge workflowId=${workflow.id} mailboxAttempted=${mailbox.attempted} mailboxDeleted=${mailbox.deleted} mailtmVaultPurged=${purged}`,
          );
        } catch (err) {
          const detail = err instanceof Error ? err.message : 'due_purge_failed';
          this.logger.warn(
            `bls_workflow_mailbox_due_purge soft_fail workflowId=${workflow.id} detail=${detail}`,
          );
        }
      }

      return {
        processedCount: due.length,
        mailboxesDeleted,
        vaultRowsPurged,
        orphansReconciled,
      };
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'due_mailboxes_failed';
      this.logger.warn(
        `bls_workflow_mailbox_due_purge soft_fail detail=${detail}`,
      );
      return empty;
    }
  }

  /**
   * Best-effort tick: delete events for terminal workflows past retention (DEC-020).
   * Never throws.
   */
  async purgeExpiredEvents(): Promise<BlsWorkflowEventsRetentionPurgeResult> {
    try {
      const cutoff = computeBlsWorkflowEventRetentionCutoff();
      const deletedCount =
        await this.workflows.deleteExpiredEventsForTerminalWorkflows({
          terminalStatuses: BLS_WORKFLOW_TERMINAL_STATUSES,
          cutoff,
          limit: BLS_WORKFLOW_EVENT_RETENTION_PURGE_BATCH,
        });
      if (deletedCount > 0) {
        this.logger.log(
          `bls_workflow_events_ttl_purge deleted=${deletedCount} cutoff=${cutoff.toISOString()}`,
        );
      }
      return { deletedCount };
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'events_ttl_failed';
      this.logger.warn(`bls_workflow_events_ttl_purge soft_fail detail=${detail}`);
      return { deletedCount: 0 };
    }
  }

  /**
   * DEC-010: eligible terminal + MAILTM_* present + due-at null → set due-at once.
   * Uses updatedAt + grace when updatedAt exists; else now + grace.
   */
  private async reconcileOrphanMailboxCleanupDueAts(): Promise<number> {
    const orphans = await this.workflows.findOrphanMailboxCleanupWorkflows({
      statuses: BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES,
      limit: BLS_WORKFLOW_MAILBOX_CLEANUP_PURGE_BATCH,
    });
    let reconciled = 0;
    for (const workflow of orphans) {
      try {
        const hasMailtm = await this.secretVault.hasAnySecretPurpose(
          workflow.id,
          BLS_SECRET_PURPOSE_MAILTM_CLEANUP,
        );
        if (!hasMailtm) {
          continue;
        }
        const from =
          workflow.updatedAt instanceof Date ? workflow.updatedAt : new Date();
        const dueAt = computeBlsWorkflowMailboxCleanupDueAt(from);
        workflow.mailboxCleanupDueAt = dueAt;
        workflow.updatedAt = new Date();
        await this.workflows.saveWorkflow(workflow);
        reconciled += 1;
        this.logger.log(
          `bls_workflow_mailbox_cleanup_orphan_reconciled workflowId=${workflow.id} dueAt=${dueAt.toISOString()}`,
        );
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'orphan_reconcile_failed';
        this.logger.warn(
          `bls_workflow_mailbox_cleanup_orphan soft_fail workflowId=${workflow.id} detail=${detail}`,
        );
      }
    }
    return reconciled;
  }

  private async deleteMailboxSoft(
    workflowId: string,
    applicationId: string,
  ): Promise<{
    attempted: boolean;
    deleted: boolean;
    warnMessage?: string;
  }> {
    const tokenPlain = await this.secretVault.loadSecretPlain({
      workflowId,
      purpose: BLS_SECRET_PURPOSE.MAILTM_TOKEN,
    });
    const passwordPlain = await this.secretVault.loadSecretPlain({
      workflowId,
      purpose: BLS_SECRET_PURPOSE.MAILTM_PASSWORD,
    });

    if (!tokenPlain && !passwordPlain) {
      await this.mailProvider.disposeSession(workflowId).catch(() => undefined);
      return { attempted: false, deleted: false };
    }

    const app = await this.appRepo.findOne({ where: { id: applicationId } });
    const address = app?.portalFormEmail?.trim() ?? '';
    const del = await this.mailProvider.deleteAccount({
      contextKey: workflowId,
      token: tokenPlain?.trim() ?? '',
      address,
      password: passwordPlain?.trim() ?? '',
    });
    await this.mailProvider.disposeSession(workflowId).catch(() => undefined);
    return {
      attempted: true,
      deleted: del.ok,
      warnMessage: del.warnMessage,
    };
  }
}
