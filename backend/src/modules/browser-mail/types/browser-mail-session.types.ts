import type {
  BrowserMailBrowser,
  BrowserMailBrowserContext,
  BrowserMailPage,
} from './browser-mail-patchright.types';

/**
 * In-memory Patchright session for one workflowId (DEC-002 / DEC-004).
 * Handles are process-local and non-serializable.
 */
export type BrowserMailSession = {
  contextKey: string;
  address: string;
  browser: BrowserMailBrowser;
  context: BrowserMailBrowserContext;
  page: BrowserMailPage;
  createdAtMs: number;
};
