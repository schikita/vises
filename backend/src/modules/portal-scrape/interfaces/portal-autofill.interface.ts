import type {
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
  PortalAutofillRunListResponse,
  PortalClientPortalProgress,
} from '../types';

/** HTTP portal autofill run orchestration port. */
export interface IPortalAutofill {
  runForHttp(input: PortalAutofillHttpInput): Promise<PortalAutofillHttpOutcome>;
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
