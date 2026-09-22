import { Injectable, Logger } from '@nestjs/common';
import type { BlsLoginClient } from '../interfaces';
import type { BlsClientResult, BlsClientTaskContext } from '../types';
import { buildBlsClientStubFailure } from '../utils';

/**
 * LOGIN client stub (superseded by BlsLoginClientService / TASK-009).
 * Kept on disk for reference; not wired in PortalScrapeModule.
 */
@Injectable()
export class StubBlsLoginClient implements BlsLoginClient {
  private readonly logger = new Logger(StubBlsLoginClient.name);

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    this.logger.log(
      `bls_login_client_stub workflowId=${context.workflowId} taskKey=${context.taskKey} attemptNo=${context.attemptNo}`,
    );
    return buildBlsClientStubFailure();
  }
}
