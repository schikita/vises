import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WORKFLOW_ROUTING_KEYS,
  type MessageEnvelope,
  type WorkflowAbortPayload,
} from '@vises/contracts';
import amqp from 'amqplib';
import type { AppEnv } from '../config';
import { BlsWorkflowAbortRegistry } from '../bls-workflow/bls-workflow-abort.registry';
import { BlsWorkflowRepository } from '../bls-workflow/bls-workflow.repository';
import { BlsWorkflowRunner } from '../bls-workflow/bls-workflow.runner';
import {
  WORKFLOW_BUS_EXCHANGE,
  WORKFLOW_BUS_EXCHANGE_TYPE,
  WORKFLOW_BUS_QUEUE_ABORT,
  WORKFLOW_BUS_QUEUE_RUN,
} from './constants';
import { isMessageEnvelope } from './utils';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;
type AmqpConsumeMessage = Parameters<
  Parameters<AmqpChannel['consume']>[1]
>[0];

/**
 * Worker RabbitMQ consumer — wake claim loop + abort signals (DEC-020 / DEC-022).
 * Prefetch 1 aligns with default single attempt slot (DEC-004).
 */
@Injectable()
export class WorkflowBusConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(WorkflowBusConsumerService.name);
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;

  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    private readonly runner: BlsWorkflowRunner,
    private readonly workflows: BlsWorkflowRepository,
    private readonly abortRegistry: BlsWorkflowAbortRegistry,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = (this.config.get('RABBITMQ_URL', { infer: true }) ?? '').trim();
    if (!url) {
      throw new Error(
        'RABBITMQ_URL is required for multi-app workflow bus (fail-closed)',
      );
    }

    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    this.connection = connection;
    this.channel = channel;
    await channel.prefetch(1);
    await channel.assertExchange(
      WORKFLOW_BUS_EXCHANGE,
      WORKFLOW_BUS_EXCHANGE_TYPE,
      { durable: true },
    );
    await channel.assertQueue(WORKFLOW_BUS_QUEUE_RUN, { durable: true });
    await channel.assertQueue(WORKFLOW_BUS_QUEUE_ABORT, { durable: true });
    await channel.bindQueue(
      WORKFLOW_BUS_QUEUE_RUN,
      WORKFLOW_BUS_EXCHANGE,
      WORKFLOW_ROUTING_KEYS.CREATED,
    );
    await channel.bindQueue(
      WORKFLOW_BUS_QUEUE_RUN,
      WORKFLOW_BUS_EXCHANGE,
      WORKFLOW_ROUTING_KEYS.SCHEDULE,
    );
    await channel.bindQueue(
      WORKFLOW_BUS_QUEUE_RUN,
      WORKFLOW_BUS_EXCHANGE,
      WORKFLOW_ROUTING_KEYS.RESUME,
    );
    await channel.bindQueue(
      WORKFLOW_BUS_QUEUE_RUN,
      WORKFLOW_BUS_EXCHANGE,
      WORKFLOW_ROUTING_KEYS.RETRY,
    );
    await channel.bindQueue(
      WORKFLOW_BUS_QUEUE_ABORT,
      WORKFLOW_BUS_EXCHANGE,
      WORKFLOW_ROUTING_KEYS.ABORT,
    );

    await channel.consume(WORKFLOW_BUS_QUEUE_RUN, (msg) => {
      void this.handleRunMessage(msg);
    });
    await channel.consume(WORKFLOW_BUS_QUEUE_ABORT, (msg) => {
      void this.handleAbortMessage(msg);
    });

    this.logger.log(
      `workflow_bus_consumer_ready queues=${WORKFLOW_BUS_QUEUE_RUN},${WORKFLOW_BUS_QUEUE_ABORT}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
    } catch {
      /* ignore */
    }
    try {
      await this.connection?.close();
    } catch {
      /* ignore */
    }
    this.channel = null;
    this.connection = null;
  }

  private async handleRunMessage(msg: AmqpConsumeMessage): Promise<void> {
    if (!msg || !this.channel) {
      return;
    }
    try {
      const envelope = this.parseEnvelope(msg);
      const routingKey = msg.fields.routingKey;
      const payload = envelope.payload as {
        workflowId?: string;
        scheduledAt?: string;
      };

      if (
        typeof payload.workflowId === 'string' &&
        payload.workflowId.trim().length > 0
      ) {
        const dueAt =
          routingKey === WORKFLOW_ROUTING_KEYS.SCHEDULE &&
          typeof payload.scheduledAt === 'string'
            ? new Date(payload.scheduledAt)
            : new Date();
        const when = Number.isNaN(dueAt.getTime()) ? new Date() : dueAt;
        if (when.getTime() <= Date.now() + 1000) {
          const workflow = await this.workflows.findById(payload.workflowId);
          if (workflow && workflow.nextRunAt == null) {
            workflow.nextRunAt = new Date();
            workflow.updatedAt = new Date();
            await this.workflows.saveWorkflow(workflow);
          }
        }
      }

      this.logger.log(
        `workflow_bus_consumed routingKey=${routingKey} correlationId=${envelope.correlationId}`,
      );
      await this.runner.tick();
      this.channel.ack(msg);
    } catch (err) {
      this.logger.error(
        `workflow_bus_consume_failed queue=${WORKFLOW_BUS_QUEUE_RUN} detail=${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      this.channel.nack(msg, false, false);
    }
  }

  private async handleAbortMessage(msg: AmqpConsumeMessage): Promise<void> {
    if (!msg || !this.channel) {
      return;
    }
    try {
      const envelope = this.parseEnvelope(msg);
      const payload = envelope.payload as WorkflowAbortPayload;
      if (
        typeof payload.workflowId === 'string' &&
        payload.workflowId.trim().length > 0
      ) {
        this.abortRegistry.requestAbort(payload.workflowId);
        this.logger.log(
          `workflow_bus_abort_signaled workflowId=${payload.workflowId} correlationId=${envelope.correlationId} reason=${payload.reason}`,
        );
      }
      this.channel.ack(msg);
    } catch (err) {
      this.logger.error(
        `workflow_bus_consume_failed queue=${WORKFLOW_BUS_QUEUE_ABORT} detail=${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      this.channel.nack(msg, false, false);
    }
  }

  private parseEnvelope(msg: NonNullable<AmqpConsumeMessage>): MessageEnvelope {
    const raw = JSON.parse(msg.content.toString('utf8')) as unknown;
    if (!isMessageEnvelope(raw)) {
      throw new Error('rejected bare or invalid message envelope');
    }
    return raw;
  }
}
