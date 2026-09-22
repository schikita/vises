import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BlsWorkflow } from '../../database/entities/bls-workflow.entity';
import { BlsWorkflowEvent } from '../../database/entities/bls-workflow-event.entity';
import { BlsWorkflowStep } from '../../database/entities/bls-workflow-step.entity';
import { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import { BLS_WORKFLOW_ACTIVE_STATUSES } from '../constants/bls-workflow.constants';
import type { AppendBlsWorkflowEventInput } from '../types/bls-workflow-api.types';
import type { BlsWorkflowGraph } from '../types/bls-workflow-graph.types';

/**
 * Persistence helpers for durable BLS workflow graph (TASK-002).
 * Events append/poll: TASK-013 / DEC-020.
 * Lock heartbeat / claimDue / attempts: see BlsWorkflowLockService (TASK-003).
 */
@Injectable()
export class BlsWorkflowRepository {
  constructor(
    @InjectRepository(BlsWorkflow)
    private readonly workflowRepo: Repository<BlsWorkflow>,
    @InjectRepository(BlsWorkflowStep)
    private readonly stepRepo: Repository<BlsWorkflowStep>,
    @InjectRepository(BlsWorkflowTask)
    private readonly taskRepo: Repository<BlsWorkflowTask>,
    @InjectRepository(BlsWorkflowEvent)
    private readonly eventRepo: Repository<BlsWorkflowEvent>,
  ) {}

  async findById(workflowId: string): Promise<BlsWorkflow | null> {
    return this.workflowRepo.findOne({ where: { id: workflowId } });
  }

  async findActiveByApplicationId(
    applicationId: string,
  ): Promise<BlsWorkflow | null> {
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
  ): Promise<BlsWorkflow | null> {
    return this.workflowRepo.findOne({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  async loadGraph(workflowId: string): Promise<BlsWorkflowGraph | null> {
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

  async saveWorkflow(row: BlsWorkflow): Promise<BlsWorkflow> {
    return this.workflowRepo.save(row);
  }

  async saveStep(row: BlsWorkflowStep): Promise<BlsWorkflowStep> {
    return this.stepRepo.save(row);
  }

  async saveTask(row: BlsWorkflowTask): Promise<BlsWorkflowTask> {
    return this.taskRepo.save(row);
  }

  async saveSteps(rows: BlsWorkflowStep[]): Promise<BlsWorkflowStep[]> {
    return this.stepRepo.save(rows);
  }

  async saveTasks(rows: BlsWorkflowTask[]): Promise<BlsWorkflowTask[]> {
    return this.taskRepo.save(rows);
  }

  createWorkflowEntity(partial: Partial<BlsWorkflow>): BlsWorkflow {
    return this.workflowRepo.create(partial);
  }

  createStepEntity(partial: Partial<BlsWorkflowStep>): BlsWorkflowStep {
    return this.stepRepo.create(partial);
  }

  createTaskEntity(partial: Partial<BlsWorkflowTask>): BlsWorkflowTask {
    return this.taskRepo.create(partial);
  }

  /**
   * Append-only event row (REQ-029). Caller must pass payload_safe only.
   */
  async appendEvent(
    input: AppendBlsWorkflowEventInput,
  ): Promise<BlsWorkflowEvent> {
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
  }): Promise<BlsWorkflowEvent[]> {
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
        BlsWorkflow,
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
}
