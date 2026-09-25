import { Injectable } from '@nestjs/common';
import { BROWSER_MAIL_SESSION_MISSING_ERROR } from './constants';
import type { BrowserMailSession } from './types';
import {
  closeBrowserMailSession,
  runWithBrowserMailSessionMutex,
} from './utils';

/**
 * In-memory Patchright session Map keyed by workflowId (DEC-002 / DEC-004).
 * Per-key async mutex serializes create/wait/dispose (DEC-003).
 * No Patchright import at construct time (DEC-012).
 */
@Injectable()
export class BrowserMailSessionStore {
  private readonly sessions = new Map<string, BrowserMailSession>();
  private readonly mutexes = new Map<string, Promise<unknown>>();

  async withLock<T>(
    contextKey: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const key = contextKey.trim();
    if (!key) {
      throw new Error(BROWSER_MAIL_SESSION_MISSING_ERROR);
    }
    return runWithBrowserMailSessionMutex({
      mutexes: this.mutexes,
      contextKey: key,
      fn,
    });
  }

  get(contextKey: string): BrowserMailSession | undefined {
    return this.sessions.get(contextKey.trim());
  }

  /**
   * Fail closed when session is absent (restart / never created / disposed).
   */
  require(contextKey: string): BrowserMailSession {
    const session = this.get(contextKey);
    if (!session) {
      throw new Error(BROWSER_MAIL_SESSION_MISSING_ERROR);
    }
    return session;
  }

  set(session: BrowserMailSession): void {
    this.sessions.set(session.contextKey.trim(), session);
  }

  /**
   * Remove Map entry and close browser/context. Idempotent.
   */
  async dispose(contextKey: string): Promise<void> {
    const key = contextKey.trim();
    if (!key) {
      return;
    }
    const session = this.sessions.get(key);
    if (!session) {
      return;
    }
    this.sessions.delete(key);
    await closeBrowserMailSession(session);
  }
}
