import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import {
  PORTAL_AUTOFILL_CAPMONSTER_CB_STATE,
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_LOCK_STALE_MS,
  PORTAL_AUTOFILL_RUN_STATUS,
} from './constants';
import { isPortalAutofillLockStale } from './utils';

/**
 * Boot-time reconcile for durable autofill runs (DEC-006).
 * Clears stale locks and terminalizes expired/permanent/CB-open rows.
 * Never launches Patchright or calls CapMonster (CON-006).
 */
@Injectable()
export class PortalAutofillResumeReconciler implements OnModuleInit {
  private readonly logger = new Logger(PortalAutofillResumeReconciler.name);

  constructor(
    @InjectRepository(PortalAutofillRun)
    private readonly runRepo: Repository<PortalAutofillRun>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.reconcileInProgressRuns();
  }

  /**
   * Scan `in_progress` rows only — lock reclaim + terminalization (REQ-007/009/010).
   */
  private async reconcileInProgressRuns(): Promise<void> {
    const nowMs = Date.now();
    const rows = await this.runRepo.find({
      where: { status: PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS },
    });

    if (rows.length === 0) {
      this.logger.log('portal_autofill_resume_reconcile scanned=0');
      return;
    }

    let clearedLocks = 0;
    let terminalized = 0;

    for (const row of rows) {
      const terminalReason = this.resolveBootTerminalReason(row, nowMs);
      if (terminalReason != null) {
        await this.persistFailedTerminal(row.id, terminalReason);
        terminalized += 1;
        this.logger.log(
          `portal_autofill_resume_reconcile action=terminalize runId=${row.id} reason=${terminalReason}`,
        );
        continue;
      }

      const hasLiveOwner =
        typeof row.lockOwner === 'string' && row.lockOwner.trim().length > 0;
      if (
        hasLiveOwner &&
        isPortalAutofillLockStale(
          row.lockHeartbeatAt,
          nowMs,
          PORTAL_AUTOFILL_LOCK_STALE_MS,
        )
      ) {
        await this.clearStaleLock(row.id);
        clearedLocks += 1;
        this.logger.log(
          `portal_autofill_resume_reconcile action=clear_stale_lock runId=${row.id}`,
        );
      }
    }

    this.logger.log(
      `portal_autofill_resume_reconcile scanned=${rows.length} clearedLocks=${clearedLocks} terminalized=${terminalized}`,
    );
  }

  /**
   * Budget expired, permanent CapMonster, or CB-open → failed (DEC-003 / DEC-006).
   * Eligible in_progress rows are left for the next staff POST to resume.
   */
  private resolveBootTerminalReason(
    row: PortalAutofillRun,
    nowMs: number,
  ): string | null {
    if (row.capmonsterPermanentFailed) {
      return 'capmonster_permanent_failed';
    }
    if (row.capmonsterCbState === PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.OPEN) {
      return 'capmonster_circuit_open';
    }
    if (
      row.captchaBudgetDeadlineAt != null &&
      nowMs >= row.captchaBudgetDeadlineAt.getTime()
    ) {
      return 'captcha_budget_expired';
    }
    return null;
  }

  private async persistFailedTerminal(
    runId: string,
    terminalReason: string,
  ): Promise<void> {
    const updatedAt = new Date();
    await this.runRepo.update(
      { id: runId },
      {
        status: PORTAL_AUTOFILL_RUN_STATUS.FAILED,
        captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURE_FAILED,
        reportOk: false,
        screenshotRelativePath: null,
        errorNote: terminalReason,
        terminalReason,
        // Keep last checkpoint stage for staff UI (same as persistRunTerminal).
        lockOwner: null,
        lockHeartbeatAt: null,
        updatedAt,
      },
    );
  }

  private async clearStaleLock(runId: string): Promise<void> {
    const updatedAt = new Date();
    await this.runRepo.update(
      { id: runId },
      {
        lockOwner: null,
        lockHeartbeatAt: null,
        updatedAt,
      },
    );
  }
}
