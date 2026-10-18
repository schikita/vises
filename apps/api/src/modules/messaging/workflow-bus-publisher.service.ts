import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WORKFLOW_ROUTING_KEYS } from '@vises/contracts';
import amqp from 'amqplib';
import type { AppEnv } from '../config';
import {
  WORKFLOW_BUS_EXCHANGE,
  WORKFLOW_BUS_EXCHANGE_TYPE,
  WORKFLOW_BUS_QUEUE_ABORT,
  WORKFLOW_BUS_QUEUE_RUN,
} from './constants';
import type { PublishWorkflowMessageInput } from './types';
import { isMessageEnvelope } from './utils';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

/**
 * API → RabbitMQ publisher for enveloped workflow bus messages (DEC-014 / DEC-022).
 * Fail-closed when RABBITMQ_URL is missing/empty (NFR-008).
 */
@Injectable()
export class WorkflowBusPublisherService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(WorkflowBusPublisherService.name);
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private ready = false;

  constructor(private readonly config: ConfigService<AppEnv, true>) {}

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
    this.ready = true;
    this.logger.log(
      `workflow_bus_publisher_ready exchange=${WORKFLOW_BUS_EXCHANGE}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.ready = false;
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

  async publish(input: PublishWorkflowMessageInput): Promise<void> {
    if (!this.ready || !this.channel) {
      throw new Error('workflow bus publisher is not ready');
    }
    if (!isMessageEnvelope(input.message)) {
      throw new Error('workflow bus rejects bare payloads — envelope required');
    }

    const body = Buffer.from(JSON.stringify(input.message), 'utf8');
    const ok = this.channel.publish(
      WORKFLOW_BUS_EXCHANGE,
      input.routingKey,
      body,
      {
        contentType: 'application/json',
        persistent: true,
        correlationId: input.message.correlationId,
      },
    );
    if (!ok) {
      this.logger.warn(
        `workflow_bus_publish_buffer_full routingKey=${input.routingKey} correlationId=${input.message.correlationId}`,
      );
    } else {
      this.logger.log(
        `workflow_bus_published routingKey=${input.routingKey} correlationId=${input.message.correlationId}`,
      );
    }
  }
}
