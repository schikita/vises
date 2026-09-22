import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { BlsWorkflow } from '../database/entities/bls-workflow.entity';
import { BLS_WORKFLOW_LOCK_STALE_MS } from './constants';
import { isBlsWorkflowLockStale } from './utils';

/**
 * Boot-time reconcile for durable BLS workflows (DEC-018 / DEC-003).
 * Clears stale locks (120s TTL); leaves `nextRunAt` / status for the runner.
 * Never launches Patchright or claims due work (CON-006 / DEC-018).
 */
@Injectable()
export class BlsWorkflowReconciler implements OnModuleInit {
  private readonly logger = new Logger(BlsWorkflowReconciler.name);

  constructor(
    @InjectRepository(BlsWorkflow)
    private readonly workflowRepo: Repository<BlsWorkflow>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.reconcileStaleLocks();
  }

  /**
   * Scan rows with a lock owner — clear when heartbeat is missing/stale.
   * Does not mutate `nextRunAt` or status (runner claims due work).
   */
  private async reconcileStaleLocks(): Promise<void> {
    const nowMs = Date.now();
    const rows = await this.workflowRepo.find({
      where: { lockOwner: Not(IsNull()) },
    });

    if (rows.length === 0) {
      this.logger.log('bls_workflow_boot_reconcile scanned=0 clearedLocks=0');
      return;
    }

    let clearedLocks = 0;
    let dueLeftForRunner = 0;

    for (const row of rows) {
      const owner = typeof row.lockOwner === 'string' ? row.lockOwner.trim() : '';
      if (owner.length === 0) {
        continue;
      }

      if (
        !isBlsWorkflowLockStale(
          row.lockHeartbeatAt,
          nowMs,
          BLS_WORKFLOW_LOCK_STALE_MS,
        )
      ) {
        continue;
      }

      await this.clearStaleLock(row.id);
      clearedLocks += 1;

      const dueForRunner =
        row.nextRunAt == null || row.nextRunAt.getTime() <= nowMs;
      if (dueForRunner) {
        dueLeftForRunner += 1;
      }

      this.logger.log(
        `bls_workflow_boot_reconcile action=clear_stale_lock workflowId=${row.id} dueForRunner=${dueForRunner}`,
      );
    }

    this.logger.log(
      `bls_workflow_boot_reconcile scanned=${rows.length} clearedLocks=${clearedLocks} dueLeftForRunner=${dueLeftForRunner}`,
    );
  }

  private async clearStaleLock(workflowId: string): Promise<void> {
    const updatedAt = new Date();
    await this.workflowRepo.update(
      { id: workflowId },
      {
        lockOwner: null,
        lockHeartbeatAt: null,
        updatedAt,
      },
    );
  }
}
