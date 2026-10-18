import type {
  PortalAutofillRunListResponse,
  PortalClientPortalProgress,
} from '../types';

/** API read port for portal autofill evidence / progress (DEC-019). */
export interface IPortalAutofill {
  getScreenshotStream(
    runId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }>;
  listRunsForApplication(
    applicationId: string,
    limit?: number,
    applicantId?: string,
  ): Promise<PortalAutofillRunListResponse>;
  /** Client-safe portal progress projection (DEC-007 / NFR-002). */
  getClientPortalProgress(
    applicationId: string,
  ): Promise<PortalClientPortalProgress>;
  /** Batch client-safe projections for application list embed (NFR-005). */
  getClientPortalProgressForApps(
    apps: ReadonlyArray<{
      id: string;
      submitCountry: string;
      applicants: unknown;
    }>,
  ): Promise<Map<string, PortalClientPortalProgress>>;
}
