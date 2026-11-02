import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { uid } from '../../shared/utils';
import { BlsHttpWorkflow } from '../database/entities/bls-http-workflow.entity';
import { BlsHttpWorkflowAttempt } from '../database/entities/bls-http-workflow-attempt.entity';
import {
  BLS_WORKFLOW_CLAIMABLE_STATUSES,
  BLS_WORKFLOW_LOCK_STALE_MS,
  BLS_WORKFLOW_MSG_LIVE_LOCK,
  BLS_WORKFLOW_MSG_NOT_FOUND,
  BLS_WORKFLOW_STATUS,
} from './constants/bls-http-workflow.constants';
import type {
  AcquireBlsHttpWorkflowLockInput,
  BlsHttpWorkflowLockLease,
  BlsHttpWorkflowLockOwnerInput,
  ClaimDueBlsHttpWorkflowInput,
  RecordBlsHttpWorkflowAttemptInput,
  RecordBlsHttpWorkflowAttemptResult,
} from './types/bls-http-workflow-lock.types';
import { buildBlsHttpWorkflowLockOwner } from './utils/build-bls-http-workflow-lock-owner.util';
import { createBlsHttpWorkflowLockError } from './utils/create-bls-http-workflow-lock-error.util';
import { hasBlsHttpWorkflowLiveNonStaleLock } from './utils/has-bls-http-workflow-live-non-stale-lock.util';

/**
 * Workflow lock lease + attempt persistence (TASK-003 / REQ-004 / REQ-005 / DEC-003).
 * Mirrors autofill lock TTLs and Proxy6 FOR UPDATE SKIP LOCKED claim.
 * Never stores secrets on attempt rows.
 */
@Injectable()
export class BlsHttpWorkflowLockService {
  private readonly logger = new Logger(BlsHttpWorkflowLockService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(BlsHttpWorkflow)
    private readonly workflowRepo: Repository<BlsHttpWorkflow>,
    @InjectRepository(BlsHttpWorkflowAttempt)
    private readonly attemptRepo: Repository<BlsHttpWorkflowAttempt>,
  ) {}

  /**
   * Acquire lock on a specific workflow. Stale / free → reclaim.
   * Live lock held by another owner → BlsHttpWorkflowLockError (409-ready).
   * Same owner → renew heartbeat (idempotent).
   */
  async acquireLock(
    input: AcquireBlsHttpWorkflowLockInput,
  ): Promise<BlsHttpWorkflowLockLease> {
    const lockOwner = input.lockOwner?.trim() || buildBlsHttpWorkflowLockOwner();

    return this.dataSource.transaction(async (manager) => {
      const row = await manager
        .createQueryBuilder(BlsHttpWorkflow, 'w')
        .setLock('pessimistic_write')
        .where('w.id = :id', { id: input.workflowId })
        .getOne();

      if (!row) {
        throw createBlsHttpWorkflowLockError({
          code: 'not_found',
          message: BLS_WORKFLOW_MSG_NOT_FOUND,
          httpStatus: 404,
        });
      }

      const now = new Date();
      const nowMs = now.getTime();
      const live = hasBlsHttpWorkflowLiveNonStaleLock({
        lockOwner: row.lockOwner,
        lockHeartbeatAt: row.lockHeartbeatAt,
        nowMs,
        staleMs: BLS_WORKFLOW_LOCK_STALE_MS,
      });

      if (live && row.lockOwner !== lockOwner) {
        throw createBlsHttpWorkflowLockError({
          code: 'live_lock',
          message: BLS_WORKFLOW_MSG_LIVE_LOCK,
          httpStatus: 409,
        });
      }

      row.lockOwner = lockOwner;
      row.lockHeartbeatAt = now;
      row.updatedAt = now;
      if (row.status === BLS_WORKFLOW_STATUS.PENDING) {
        row.status = BLS_WORKFLOW_STATUS.RUNNING;
      }
      await manager.save(row);
      return { workflow: row, lockOwner };
    });
  }

  /**
   * Clear lock when caller still owns it (idempotent if already free / other owner).
   */
  async releaseLock(input: BlsHttpWorkflowLockOwnerInput): Promise<void> {
    const owner = input.lockOwner.trim();
    if (owner === '') {
      return;
    }
    const now = new Date();
    await this.workflowRepo
      .createQueryBuilder()
      .update(BlsHttpWorkflow)
      .set({
        lockOwner: null,
        lockHeartbeatAt: null,
        updatedAt: now,
      })
      .where('id = :id', { id: input.workflowId })
      .andWhere('lock_owner = :owner', { owner })
      .execute();
  }

  /**
   * Renew lock heartbeat when caller still owns the lock.
   * Live lock by another owner → 409-ready error; missing/wrong owner → conflict.
   */
  async heartbeat(input: BlsHttpWorkflowLockOwnerInput): Promise<void> {
    const owner = input.lockOwner.trim();
    if (owner === '') {
      throw createBlsHttpWorkflowLockError({
        code: 'live_lock',
        message: BLS_WORKFLOW_MSG_LIVE_LOCK,
        httpStatus: 409,
      });
    }

    await this.dataSource.transaction(async (manager) => {
      const row = await manager
        .createQueryBuilder(BlsHttpWorkflow, 'w')
        .setLock('pessimistic_write')
        .where('w.id = :id', { id: input.workflowId })
        .getOne();

      if (!row) {
        throw createBlsHttpWorkflowLockError({
          code: 'not_found',
          message: BLS_WORKFLOW_MSG_NOT_FOUND,
          httpStatus: 404,
        });
      }

      const now = new Date();
      const live = hasBlsHttpWorkflowLiveNonStaleLock({
        lockOwner: row.lockOwner,
        lockHeartbeatAt: row.lockHeartbeatAt,
        nowMs: now.getTime(),
        staleMs: BLS_WORKFLOW_LOCK_STALE_MS,
      });

      if (live && row.lockOwner !== owner) {
        throw createBlsHttpWorkflowLockError({
          code: 'live_lock',
          message: BLS_WORKFLOW_MSG_LIVE_LOCK,
          httpStatus: 409,
        });
      }

      if (row.lockOwner !== owner) {
        throw createBlsHttpWorkflowLockError({
          code: 'live_lock',
          message: BLS_WORKFLOW_MSG_LIVE_LOCK,
          httpStatus: 409,
        });
      }

      row.lockHeartbeatAt = now;
      row.updatedAt = now;
      await manager.save(row);
    });
  }

  /**
   * Claim one due workflow for the runner (TASK-004).
   * Uses FOR UPDATE SKIP LOCKED; returns null when none available.
   */
  async claimDueWorkflow(
    input: ClaimDueBlsHttpWorkflowInput = {},
  ): Promise<BlsHttpWorkflowLockLease | null> {
    const lockOwner = input.lockOwner?.trim() || buildBlsHttpWorkflowLockOwner();

    return this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const staleBefore = new Date(now.getTime() - BLS_WORKFLOW_LOCK_STALE_MS);

      const candidate = await manager
        .createQueryBuilder(BlsHttpWorkflow, 'w')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('w.status IN (:...statuses)', {
          statuses: [...BLS_WORKFLOW_CLAIMABLE_STATUSES],
        })
        .andWhere('(w.next_run_at IS NULL OR w.next_run_at <= :now)', { now })
        .andWhere(
          '(w.lock_owner IS NULL OR TRIM(w.lock_owner) = \'\' OR w.lock_heartbeat_at IS NULL OR w.lock_heartbeat_at < :staleBefore)',
          { staleBefore },
        )
        .orderBy('w.next_run_at', 'ASC', 'NULLS FIRST')
        .addOrderBy('w.updated_at', 'ASC')
        .take(1)
        .getOne();

      if (!candidate) {
        return null;
      }

      candidate.lockOwner = lockOwner;
      candidate.lockHeartbeatAt = now;
      candidate.updatedAt = now;
      if (
        candidate.status === BLS_WORKFLOW_STATUS.PENDING ||
        candidate.status === BLS_WORKFLOW_STATUS.WAITING_RETRY
      ) {
        candidate.status = BLS_WORKFLOW_STATUS.RUNNING;
      }
      await manager.save(candidate);

      this.logger.log(
        `bls_workflow_claim workflowId=${candidate.id} lockOwner=${lockOwner}`,
      );
      return { workflow: candidate, lockOwner };
    });
  }

  /**
   * Persist one attempt row for a task execution (REQ-004).
   * Never writes secrets / field values — callers must pass safe strings only.
   */
  async recordAttempt(
    input: RecordBlsHttpWorkflowAttemptInput,
  ): Promise<RecordBlsHttpWorkflowAttemptResult> {
    const startedAt = input.startedAt ?? new Date();
    const finishedAt =
      input.finishedAt === undefined ? new Date() : input.finishedAt;

    let attemptNo = input.attemptNo;
    if (attemptNo == null) {
      const raw = await this.attemptRepo
        .createQueryBuilder('a')
        .select('MAX(a.attempt_no)', 'max')
        .where('a.task_id = :taskId', { taskId: input.taskId })
        .getRawOne<{ max: string | number | null }>();
      const max =
        raw?.max == null || raw.max === ''
          ? 0
          : typeof raw.max === 'number'
            ? raw.max
            : Number.parseInt(String(raw.max), 10);
      attemptNo = (Number.isFinite(max) ? max : 0) + 1;
    }

    const row = this.attemptRepo.create({
      id: uid('bls-wa'),
      taskId: input.taskId,
      attemptNo,
      outcome: input.outcome,
      errorClass: input.errorClass ?? null,
      errorCode: input.errorCode ?? null,
      errorMessage: input.errorMessage ?? null,
      evidenceRelativePath: input.evidenceRelativePath ?? null,
      startedAt,
      finishedAt,
    });

    // Upsert: a staff retry resets the task attempt counter, so (taskId,
    // attemptNo) may already exist from an earlier cycle — overwrite it with
    // the latest outcome instead of violating the unique constraint.
    await this.attemptRepo.upsert(row, ['taskId', 'attemptNo']);
    return row;
  }
}
