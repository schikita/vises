import type { FieldResult, PortalFieldName } from './portal-field.types';
import type { MappingResult } from './portal-mapping.types';

export interface ReportFieldRow {
  field: PortalFieldName;
  status: FieldResult['status'];
  value?: string;
  reason?: string;
  provisional?: boolean;
}

/** Screenshot evidence metadata on successful fill-path reports (DEC-007). */
export type AutofillEvidence = {
  runId: string;
  applicationId: string;
  applicantId: string;
  createdAt: string;
  captureOk: boolean;
  relativePath: string | null;
  downloadPath: string;
  error?: string;
};

export interface AutofillReport {
  ok: boolean;
  applicationId: string;
  applicantId: string;
  summary: {
    filled: number;
    skipped: number;
    failed: number;
  };
  fields: ReportFieldRow[];
  metadata: MappingResult['metadata'];
  generatedAt: string;
  /** Present only when fill pipeline ran on an opened page (REQ-002 / DEC-007). */
  evidence?: AutofillEvidence;
}
