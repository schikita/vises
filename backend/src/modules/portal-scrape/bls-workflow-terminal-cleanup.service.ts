import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { MailTmService } from '../mailtm';
import {
  BLS_SECRET_PURPOSE,
  BLS_WORKFLOW_EVENT_RETENTION_PURGE_BATCH,
  BLS_WORKFLOW_TERMINAL_STATUSES,
} from './constants';
import { BlsSecretVaultService } from './bls-secret-vault.service';
import type {
  BlsWorkflowEventsRetentionPurgeResult,
  BlsWorkflowTerminalCleanupInput,
  BlsWorkflowTerminalCleanupResult,
} from './types/bls-workflow-terminal-cleanup.types';
import { computeBlsWorkflowEventRetentionCutoff } from './utils/compute-bls-workflow-event-retention-cutoff.util';
import { isBlsWorkflowMailboxCleanupEligible } from './utils/is-bls-workflow-mailbox-cleanup-eligible.util';
import { BlsWorkflowRepository } from './workflow/bls-workflow.repository';

/**
 * Terminal Mail.tm delete + vault purge + optional events TTL (REQ-016 / DEC-007 / DEC-020).
 * Soft-fail throughout; never logs tokens, passwords, or DEK material.
 * Not invoked on REGISTER / OTP success alone.
 */
@Injectable()
export class BlsWorkflowTerminalCleanupService {
  private readonly logger = new Logger(BlsWorkflowTerminalCleanupService.name);

  constructor(
    private readonly workflows: BlsWorkflowRepository,
    private readonly secretVault: BlsSecretVaultService,
    private readonly mailTm: MailTmService,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
  ) {}

  /**
   * After workflow reaches a mailbox-cleanup terminal status:
   * soft-fail Mail.tm delete via vaulted credentials, then purge vault rows.
   * Never throws to callers.
   */
  async cleanupAfterTerminal(
    input: BlsWorkflowTerminalCleanupInput,
  ): Promise<BlsWorkflowTerminalCleanupResult> {
    const empty: BlsWorkflowTerminalCleanupResult = {
      mailboxDeleteAttempted: false,
      mailboxDeleted: false,
      vaultRowsPurged: 0,
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
          `bls_workflow_terminal_cleanup skipped workflowId=${workflowId} status=${workflow.status}`,
        );
        return empty;
      }

      const mailbox = await this.deleteMailboxSoft(workflowId, workflow.applicationId);
      const vaultRowsPurged =
        await this.secretVault.purgeSecretsForWorkflow(workflowId);

      this.logger.log(
        `bls_workflow_terminal_cleanup workflowId=${workflowId} mailboxAttempted=${mailbox.attempted} mailboxDeleted=${mailbox.deleted} vaultRowsPurged=${vaultRowsPurged}`,
      );
      if (mailbox.warnMessage) {
        this.logger.warn(mailbox.warnMessage);
      }

      return {
        mailboxDeleteAttempted: mailbox.attempted,
        mailboxDeleted: mailbox.deleted,
        mailboxDeleteWarn: mailbox.warnMessage,
        vaultRowsPurged,
      };
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'cleanup_failed';
      this.logger.warn(
        `bls_workflow_terminal_cleanup soft_fail workflowId=${workflowId} detail=${detail}`,
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
      return { attempted: false, deleted: false };
    }

    let accountId = '';
    let token = tokenPlain?.trim() ?? '';

    if (token) {
      const fromMe = await this.mailTm.resolveAccountIdFromToken(token);
      if (fromMe.ok) {
        accountId = fromMe.accountId;
        token = fromMe.token;
      }
    }

    if (!accountId || !token) {
      const app = await this.appRepo.findOne({ where: { id: applicationId } });
      const address = app?.portalFormEmail?.trim() ?? '';
      const password = passwordPlain?.trim() ?? '';
      if (!address || !password) {
        return {
          attempted: true,
          deleted: false,
          warnMessage:
            'Mail.tm terminal delete skipped: missing resolve credentials',
        };
      }
      const login = await this.mailTm.loginAccount({ address, password });
      if (!login.ok) {
        return {
          attempted: true,
          deleted: false,
          warnMessage: login.warnMessage,
        };
      }
      accountId = login.accountId;
      token = login.token;
    }

    const del = await this.mailTm.deleteAccount({ accountId, token });
    return {
      attempted: true,
      deleted: del.ok,
      warnMessage: del.warnMessage,
    };
  }
}
