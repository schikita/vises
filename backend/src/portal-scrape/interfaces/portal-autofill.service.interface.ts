import type {
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
  PortalAutofillRunListResponse,
} from '../types';

export interface IPortalAutofillService {
  runForHttp(input: PortalAutofillHttpInput): Promise<PortalAutofillHttpOutcome>;
  getScreenshotStream(
    runId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }>;
  listRunsForApplication(
    applicationId: string,
    limit?: number,
  ): Promise<PortalAutofillRunListResponse>;
}
