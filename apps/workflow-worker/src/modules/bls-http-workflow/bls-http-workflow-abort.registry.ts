import { Injectable, Logger } from '@nestjs/common';
import type {
  BlsHttpWorkflowAbortAttemptEntry,
  BlsHttpWorkflowAbortCloseHook,
} from './types/bls-http-workflow-abort.types';

/**
 * Process-local abort coordination for in-flight workflow attempts (DEC-001).
 * Control plane signals via `requestAbort` without awaiting teardown (DEC-002).
 * Worker: Rabbit `workflow.abort` + DB status watch call `requestAbort` (DEC-008).
 * Scoped to one Nest process — no Redis/Bull/WS.
 */
@Injectable()
export class BlsHttpWorkflowAbortRegistry {
  private readonly logger = new Logger(BlsHttpWorkflowAbortRegistry.name);
  private readonly entries = new Map<string, BlsHttpWorkflowAbortAttemptEntry>();

  /**
   * Start (or replace) an attempt for `workflowId`.
   * Clears prior hooks so resume does not inherit a sticky abort (edge 10).
   */
  beginAttempt(workflowId: string): AbortSignal {
    const prior = this.entries.get(workflowId);
    const generation = (prior?.generation ?? 0) + 1;
    const controller = new AbortController();
    this.entries.set(workflowId, {
      generation,
      controller,
      closeHooks: [],
    });
    return controller.signal;
  }

  /**
   * Register a force-close hook for the active attempt.
   * If abort was already requested, runs the hook fire-and-forget immediately.
   */
  registerCloseHook(
    workflowId: string,
    hook: BlsHttpWorkflowAbortCloseHook,
  ): void {
    const entry = this.entries.get(workflowId);
    if (!entry) {
      return;
    }
    if (entry.controller.signal.aborted) {
      this.invokeCloseHook(workflowId, hook);
      return;
    }
    entry.closeHooks.push(hook);
  }

  /**
   * Signal abort for `workflowId` and fire close hooks without awaiting (DEC-002).
   * Missing entry is a no-op (idempotent double pause/cancel).
   */
  requestAbort(workflowId: string): void {
    const entry = this.entries.get(workflowId);
    if (!entry) {
      return;
    }
    if (!entry.controller.signal.aborted) {
      entry.controller.abort();
    }
    const hooks = entry.closeHooks.splice(0, entry.closeHooks.length);
    for (const hook of hooks) {
      this.invokeCloseHook(workflowId, hook);
    }
    this.logger.log(`bls_workflow_abort_requested workflowId=${workflowId}`);
  }

  /** Clear attempt entry so a later resume is not stuck aborted. */
  endAttempt(workflowId: string): void {
    this.entries.delete(workflowId);
  }

  /** Whether the active attempt (if any) has been aborted. */
  isAbortRequested(workflowId: string): boolean {
    const entry = this.entries.get(workflowId);
    return entry?.controller.signal.aborted ?? false;
  }

  private invokeCloseHook(
    workflowId: string,
    hook: BlsHttpWorkflowAbortCloseHook,
  ): void {
    void Promise.resolve()
      .then(() => hook())
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `bls_workflow_abort_close_hook_error workflowId=${workflowId} message=${message.slice(0, 200)}`,
        );
      });
  }
}
