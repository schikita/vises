import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BlsHttpWorkflow } from '../database/entities/bls-http-workflow.entity';
import { BlsHttpWorkflowEvent } from '../database/entities/bls-http-workflow-event.entity';
import { BlsHttpWorkflowStep } from '../database/entities/bls-http-workflow-step.entity';
import { BlsHttpWorkflowTask } from '../database/entities/bls-http-workflow-task.entity';
import { BLS_WORKFLOW_ACTIVE_STATUSES } from './constants/bls-http-workflow.constants';
import type { AppendBlsHttpWorkflowEventInput } from './types/bls-http-workflow-api.types';
import type { BlsHttpWorkflowGraph } from './types/bls-http-workflow-graph.types';

/**
 * Persistence helpers for durable BLS workflow graph (TASK-002).
 * Events append/poll: TASK-013 / DEC-020.
 * Lock heartbeat / claimDue / attempts: see BlsHttpWorkflowLockService (TASK-003).
 */
@Injectable()
export class BlsHttpWorkflowRepository {
  constructor(
    @InjectRepository(BlsHttpWorkflow)
    private readonly workflowRepo: Repository<BlsHttpWorkflow>,
    @InjectRepository(BlsHttpWorkflowStep)
    private readonly stepRepo: Repository<BlsHttpWorkflowStep>,
    @InjectRepository(BlsHttpWorkflowTask)
    private readonly taskRepo: Repository<BlsHttpWorkflowTask>,
    @InjectRepository(BlsHttpWorkflowEvent)
    private readonly eventRepo: Repository<BlsHttpWorkflowEvent>,
  ) {}

  async findById(workflowId: string): Promise<BlsHttpWorkflow | null> {
    return this.workflowRepo.findOne({ where: { id: workflowId } });
  }

  async findActiveByApplicationId(
    applicationId: string,
  ): Promise<BlsHttpWorkflow | null> {
    return this.workflowRepo.findOne({
      where: {
        applicationId,
        status: In([...BLS_WORKFLOW_ACTIVE_STATUSES]),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByApplicationId(
    applicationId: string,
  ): Promise<BlsHttpWorkflow | null> {
    return this.workflowRepo.findOne({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  async loadGraph(workflowId: string): Promise<BlsHttpWorkflowGraph | null> {
    const workflow = await this.findById(workflowId);
    if (!workflow) {
      return null;
    }
    const steps = await this.stepRepo.find({
      where: { workflowId },
      order: { ordinal: 'ASC' },
    });
    const stepIds = steps.map((s) => s.id);
    const tasks =
      stepIds.length === 0
        ? []
        : await this.taskRepo.find({
            where: { stepId: In(stepIds) },
            order: { ordinal: 'ASC' },
          });
    return { workflow, steps, tasks };
  }

  async saveWorkflow(row: BlsHttpWorkflow): Promise<BlsHttpWorkflow> {
    return this.workflowRepo.save(row);
  }

  async saveStep(row: BlsHttpWorkflowStep): Promise<BlsHttpWorkflowStep> {
    return this.stepRepo.save(row);
  }

  async saveTask(row: BlsHttpWorkflowTask): Promise<BlsHttpWorkflowTask> {
    return this.taskRepo.save(row);
  }

  async saveSteps(rows: BlsHttpWorkflowStep[]): Promise<BlsHttpWorkflowStep[]> {
    return this.stepRepo.save(rows);
  }

  async saveTasks(rows: BlsHttpWorkflowTask[]): Promise<BlsHttpWorkflowTask[]> {
    return this.taskRepo.save(rows);
  }

  createWorkflowEntity(partial: Partial<BlsHttpWorkflow>): BlsHttpWorkflow {
    return this.workflowRepo.create(partial);
  }

  createStepEntity(partial: Partial<BlsHttpWorkflowStep>): BlsHttpWorkflowStep {
    return this.stepRepo.create(partial);
  }

  createTaskEntity(partial: Partial<BlsHttpWorkflowTask>): BlsHttpWorkflowTask {
    return this.taskRepo.create(partial);
  }

  /**
   * Append-only event row (REQ-029). Caller must pass payload_safe only.
   */
  async appendEvent(
    input: AppendBlsHttpWorkflowEventInput,
  ): Promise<BlsHttpWorkflowEvent> {
    const row = this.eventRepo.create({
      workflowId: input.workflowId,
      eventType: input.eventType,
      stepKey: input.stepKey ?? null,
      taskKey: input.taskKey ?? null,
      payloadSafe: input.payloadSafe ?? {},
    });
    return this.eventRepo.save(row);
  }

  /**
   * Poll events with id > sinceEventId, ascending (DEC-006).
   */
  async listEventsSince(input: {
    workflowId: string;
    sinceEventId: number;
    limit: number;
  }): Promise<BlsHttpWorkflowEvent[]> {
    return this.eventRepo
      .createQueryBuilder('e')
      .where('e.workflow_id = :workflowId', { workflowId: input.workflowId })
      .andWhere('e.id > :sinceEventId', {
        sinceEventId: String(input.sinceEventId),
      })
      .orderBy('e.id', 'ASC')
      .take(input.limit)
      .getMany();
  }

  /** Max event id for workflow, or null when empty. */
  async findLatestEventId(workflowId: string): Promise<number | null> {
    const raw = await this.eventRepo
      .createQueryBuilder('e')
      .select('MAX(e.id)', 'maxId')
      .where('e.workflow_id = :workflowId', { workflowId })
      .getRawOne<{ maxId: string | null }>();
    if (raw?.maxId == null || raw.maxId === '') {
      return null;
    }
    const n = Number(raw.maxId);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * Best-effort TTL delete of append-only events for terminal workflows
   * whose `updated_at` is older than the retention cutoff (DEC-020).
   */
  async deleteExpiredEventsForTerminalWorkflows(input: {
    terminalStatuses: readonly string[];
    cutoff: Date;
    limit: number;
  }): Promise<number> {
    if (input.terminalStatuses.length === 0 || input.limit <= 0) {
      return 0;
    }
    const ids = await this.eventRepo
      .createQueryBuilder('e')
      .select('e.id', 'id')
      .innerJoin(
        BlsHttpWorkflow,
        'w',
        'w.id = e.workflow_id',
      )
      .where('w.status IN (:...statuses)', {
        statuses: [...input.terminalStatuses],
      })
      .andWhere('w.updated_at < :cutoff', { cutoff: input.cutoff })
      .orderBy('e.id', 'ASC')
      .limit(input.limit)
      .getRawMany<{ id: string }>();

    if (ids.length === 0) {
      return 0;
    }
    const result = await this.eventRepo.delete(ids.map((row) => row.id));
    return result.affected ?? 0;
  }

  /**
   * Workflows with mailboxCleanupDueAt <= now in cleanup-eligible statuses (DEC-004).
   */
  async findDueMailboxCleanupWorkflows(input: {
    statuses: readonly string[];
    now: Date;
    limit: number;
  }): Promise<BlsHttpWorkflow[]> {
    if (input.statuses.length === 0 || input.limit <= 0) {
      return [];
    }
    return this.workflowRepo
      .createQueryBuilder('w')
      .where('w.status IN (:...statuses)', {
        statuses: [...input.statuses],
      })
      .andWhere('w.mailbox_cleanup_due_at IS NOT NULL')
      .andWhere('w.mailbox_cleanup_due_at <= :now', { now: input.now })
      .orderBy('w.mailbox_cleanup_due_at', 'ASC')
      .take(input.limit)
      .getMany();
  }

  /**
   * Eligible terminals with null due-at (DEC-010 orphan heal candidates).
   * Caller checks MAILBOX_* presence before setting due-at.
   */
  async findOrphanMailboxCleanupWorkflows(input: {
    statuses: readonly string[];
    limit: number;
  }): Promise<BlsHttpWorkflow[]> {
    if (input.statuses.length === 0 || input.limit <= 0) {
      return [];
    }
    return this.workflowRepo
      .createQueryBuilder('w')
      .where('w.status IN (:...statuses)', {
        statuses: [...input.statuses],
      })
      .andWhere('w.mailbox_cleanup_due_at IS NULL')
      .orderBy('w.updated_at', 'ASC')
      .take(input.limit)
      .getMany();
  }
}
