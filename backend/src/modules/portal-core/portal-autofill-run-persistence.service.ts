import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { resolveUploadDir } from '../apps/utils';
import { uid } from '../../shared/utils';
import { BlsWorkflowStep } from '../database/entities/bls-workflow-step.entity';
import { PortalAutofillRun } from '../database/entities/portal-autofill-run.entity';
import {
  PORTAL_AUTOFILL_PIPELINE_STAGE,
  PORTAL_AUTOFILL_RUN_STATUS,
} from './constants/portal-autofill-run-lifecycle.constants';
import { PORTAL_AUTOFILL_CAPTURE_STATUS } from './constants/portal-evidence.constants';
import type {
  EnsureWorkflowLinkedAutofillRunInput,
  EnsureWorkflowLinkedAutofillRunResult,
  PersistPortalAutofillRunTerminalInput,
} from './types/portal-autofill-run-persistence.types';
import type { PortalAutofillCheckpointPatch } from './types/portal-autofill-checkpoint.types';
import { buildEvidenceAbsolutePath } from './utils/build-evidence-absolute-path.util';
import { buildPortalAutofillLockOwner } from './utils/build-portal-autofill-lock-owner.util';
import { ensureEvidenceDir } from './utils/ensure-evidence-dir.util';

/**
 * Shared `portal_autofill_runs` create/update helpers (DEC-012 / REQ-026).
 * Soft-links REGISTER steps; never writes secrets; bls_* remains SoT.
 * Does not mutate unrelated legacy in-flight staff runs.
 */
@Injectable()
export class PortalAutofillRunPersistenceService {
  private readonly logger = new Logger(PortalAutofillRunPersistenceService.name);
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(PortalAutofillRun)
    private readonly runRepo: Repository<PortalAutofillRun>,
    @InjectRepository(BlsWorkflowStep)
    private readonly stepRepo: Repository<BlsWorkflowStep>,
    config: ConfigService<AppEnv, true>,
  ) {
    this.uploadDir = resolveUploadDir(
      config.get('UPLOAD_DIR', { infer: true }),
    );
  }

  /**
   * Create or reclaim a linked RegisterUser run for a REGISTER step.
   * Soft-link only — no hard FK; leaves historical/legacy rows untouched.
   */
  async ensureLinkedForRegisterStep(
    input: EnsureWorkflowLinkedAutofillRunInput,
  ): Promise<EnsureWorkflowLinkedAutofillRunResult> {
    const step = await this.stepRepo.findOne({
      where: { id: input.stepId },
    });
    const existingId = step?.portalAutofillRunId?.trim() ?? '';
    if (existingId) {
      const existing = await this.runRepo.findOne({
        where: { id: existingId },
      });
      if (existing?.status === PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS) {
        const run = existing;
        const lockOwner = buildPortalAutofillLockOwner();
        const now = new Date();
        await this.runRepo.update(
          { id: run.id },
          {
            lockOwner,
            lockHeartbeatAt: now,
            updatedAt: now,
            pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.PRE_BROWSER,
            applicationId: input.applicationId,
            applicantId: input.applicantId,
          },
        );
        const paths = buildEvidenceAbsolutePath(
          input.applicationId,
          run.id,
          this.uploadDir,
        );
        ensureEvidenceDir(paths.absolutePath);
        this.logger.log(
          `portal_autofill_run reclaimed runId=${run.id} workflowId=${input.workflowId} stepId=${input.stepId}`,
        );
        return {
          runId: run.id,
          relativePath: paths.relativePath,
          absolutePath: paths.absolutePath,
          created: false,
        };
      }
    }

    const runId = uid('paf');
    const createdAt = new Date();
    const lockOwner = buildPortalAutofillLockOwner();
    await this.runRepo.save({
      id: runId,
      applicationId: input.applicationId,
      applicantId: input.applicantId,
      screenshotRelativePath: null,
      captureStatus: PORTAL_AUTOFILL_CAPTURE_STATUS.PENDING,
      reportOk: false,
      triggeredByUserId: null,
      errorNote: null,
      createdAt,
      status: PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS,
      pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.PRE_BROWSER,
      updatedAt: createdAt,
      lockOwner,
      lockHeartbeatAt: createdAt,
      captchaAttempt: 0,
      captchaBudgetDeadlineAt: null,
      capmonsterCbState: null,
      capmonsterCbConsecutiveFailures: 0,
      capmonsterCbOpenedAt: null,
      capmonsterPermanentFailed: false,
      capmonsterInflightTaskId: null,
      fieldProgressJson: null,
      terminalReason: null,
    });

    await this.stepRepo.update(
      { id: input.stepId },
      { portalAutofillRunId: runId },
    );

    const paths = buildEvidenceAbsolutePath(
      input.applicationId,
      runId,
      this.uploadDir,
    );
    ensureEvidenceDir(paths.absolutePath);

    this.logger.log(
      `portal_autofill_run created runId=${runId} workflowId=${input.workflowId} stepId=${input.stepId}`,
    );

    return {
      runId,
      relativePath: paths.relativePath,
      absolutePath: paths.absolutePath,
      created: true,
    };
  }

  /** Durable checkpoint patch (no field values / secrets). */
  async applyCheckpoint(
    runId: string,
    patch: PortalAutofillCheckpointPatch,
  ): Promise<void> {
    const now = new Date();
    await this.runRepo.update(
      { id: runId },
      {
        ...(patch.pipelineStage !== undefined
          ? { pipelineStage: patch.pipelineStage }
          : {}),
        ...(patch.fieldProgress !== undefined
          ? { fieldProgressJson: patch.fieldProgress }
          : {}),
        ...(patch.captchaAttempt !== undefined
          ? { captchaAttempt: patch.captchaAttempt }
          : {}),
        ...(patch.captchaBudgetDeadlineAt !== undefined
          ? { captchaBudgetDeadlineAt: patch.captchaBudgetDeadlineAt }
          : {}),
        ...(patch.capmonsterCb !== undefined
          ? {
              capmonsterCbState: patch.capmonsterCb.state,
              capmonsterCbConsecutiveFailures:
                patch.capmonsterCb.consecutiveFailures,
              capmonsterCbOpenedAt: patch.capmonsterCb.openedAt,
            }
          : {}),
        ...(patch.capmonsterPermanentFailed !== undefined
          ? { capmonsterPermanentFailed: patch.capmonsterPermanentFailed }
          : {}),
        ...(patch.capmonsterInflightTaskId !== undefined
          ? { capmonsterInflightTaskId: patch.capmonsterInflightTaskId }
          : {}),
        lockHeartbeatAt: now,
        updatedAt: now,
      },
    );
  }

  /** Heartbeat only — releases neither lock nor stage. */
  async bumpHeartbeat(runId: string): Promise<void> {
    const now = new Date();
    await this.runRepo.update(
      { id: runId },
      { lockHeartbeatAt: now, updatedAt: now },
    );
  }

  /**
   * Mark run terminal and clear execution lock (REQ-016 parity).
   * Workflow SoT stays on bls_* — never COMPLETED from this row alone.
   */
  async persistTerminal(
    input: PersistPortalAutofillRunTerminalInput,
  ): Promise<void> {
    const updatedAt = new Date();
    const pipelineStage =
      input.status === PORTAL_AUTOFILL_RUN_STATUS.SUCCEEDED
        ? PORTAL_AUTOFILL_PIPELINE_STAGE.TERMINAL
        : undefined;
    await this.runRepo.update(
      { id: input.runId },
      {
        status: input.status,
        captureStatus: input.captureStatus,
        reportOk: input.reportOk,
        ...(input.screenshotRelativePath !== undefined
          ? { screenshotRelativePath: input.screenshotRelativePath }
          : {}),
        ...(input.errorNote !== undefined ? { errorNote: input.errorNote } : {}),
        ...(input.terminalReason !== undefined
          ? { terminalReason: input.terminalReason }
          : {}),
        ...(pipelineStage !== undefined ? { pipelineStage } : {}),
        lockOwner: null,
        lockHeartbeatAt: null,
        updatedAt,
      },
    );
  }

  /** Mark navigating immediately before browser work. */
  async markNavigating(runId: string): Promise<void> {
    const now = new Date();
    await this.runRepo.update(
      { id: runId },
      {
        pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.NAVIGATING,
        lockHeartbeatAt: now,
        updatedAt: now,
      },
    );
  }
}
