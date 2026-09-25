import { Injectable, Logger } from '@nestjs/common';
import type { BlsPasswordChangeClient } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import { buildBlsClientStubFailure } from '../utils';

/**
 * PASSWORD_CHANGE client stub (superseded by BlsPasswordChangeClientService).
 */
@Injectable()
export class StubBlsPasswordChangeClient implements BlsPasswordChangeClient {
  private readonly logger = new Logger(StubBlsPasswordChangeClient.name);

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    this.logger.log(
      `bls_password_change_client_stub workflowId=${context.workflowId} taskKey=${context.taskKey} attemptNo=${context.attemptNo}`,
    );
    return buildBlsClientStubFailure();
  }
}
