/**
 * REGISTER client stub (superseded by BlsRegisterClientService in TASK-008).
 * Kept on disk unwired for reference.
 */
import { Injectable, Logger } from '@nestjs/common';
import type { BlsRegisterClient } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import { buildBlsClientStubFailure } from '../utils';

@Injectable()
export class StubBlsRegisterClient implements BlsRegisterClient {
  private readonly logger = new Logger(StubBlsRegisterClient.name);

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    this.logger.log(
      `bls_register_client_stub workflowId=${context.workflowId} taskKey=${context.taskKey} attemptNo=${context.attemptNo}`,
    );
    return buildBlsClientStubFailure();
  }
}
