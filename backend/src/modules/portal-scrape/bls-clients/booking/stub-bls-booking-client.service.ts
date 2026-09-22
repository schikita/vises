import { Injectable, Logger } from '@nestjs/common';
import type { BlsBookingClient } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import { buildBlsClientStubFailure } from '../utils';

/**
 * BOOK client stub — superseded by BlsBookingClientService (TASK-012).
 * Kept for reference / offline DI experiments only.
 */
@Injectable()
export class StubBlsBookingClient implements BlsBookingClient {
  private readonly logger = new Logger(StubBlsBookingClient.name);

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    this.logger.log(
      `bls_booking_client_stub workflowId=${context.workflowId} taskKey=${context.taskKey} attemptNo=${context.attemptNo}`,
    );
    return buildBlsClientStubFailure();
  }
}
