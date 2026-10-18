import { Injectable, Logger } from '@nestjs/common';
import type { BlsStatusClient } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import { buildBlsClientStubFailure } from '../utils';

/**
 * STATUS_VALIDATE client stub (superseded by BlsStatusClientService / TASK-011).
 */
@Injectable()
export class StubBlsStatusClient implements BlsStatusClient {
  private readonly logger = new Logger(StubBlsStatusClient.name);

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    this.logger.log(
      `bls_status_client_stub workflowId=${context.workflowId} taskKey=${context.taskKey} attemptNo=${context.attemptNo}`,
    );
    return buildBlsClientStubFailure();
  }
}
