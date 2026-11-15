import type { BlsApplicantPortalStatus } from './bls-applicant-portal-status.types';
import type { PORTAL_STATUS_CHECKPOINT_STEP } from '../constants/portal-status-checkpoint-step.constants';
import type { PORTAL_STATUS_MEMBER_BRANCH } from '../constants/portal-status-member-branch.constants';
import type {
  PORTAL_STATUS_FIELD_FAIL_REASON,
  PORTAL_STATUS_FIELD_SKIP_REASON,
} from '../constants/portal-status-field-reason.constants';

/** Checkpoint `lastCompletedStep` token (agent brief §2). */
export type PortalStatusCheckpointStep =
  (typeof PORTAL_STATUS_CHECKPOINT_STEP)[keyof typeof PORTAL_STATUS_CHECKPOINT_STEP];

/** OQ-005 member branch when pre-start family members exist. */
export type PortalStatusMemberBranch =
  (typeof PORTAL_STATUS_MEMBER_BRANCH)[keyof typeof PORTAL_STATUS_MEMBER_BRANCH];

/** Skip reason code — no field values (OQ-007). */
export type PortalStatusFieldSkipReason =
  (typeof PORTAL_STATUS_FIELD_SKIP_REASON)[keyof typeof PORTAL_STATUS_FIELD_SKIP_REASON];

/** Fail reason code — no field values (REQ-016). */
export type PortalStatusFieldFailReason =
  (typeof PORTAL_STATUS_FIELD_FAIL_REASON)[keyof typeof PORTAL_STATUS_FIELD_FAIL_REASON];

/** One failed field entry: id + reason code only (CON-003 / NFR-002). */
export type PortalStatusFieldProgressFailedEntry = {
  fieldId: string;
  reasonCode: string;
};

/**
 * Section/field progress bag (mirror register semantics, list shape).
 * Ids and reason codes only — never raw values.
 */
export type PortalStatusFieldProgress = {
  filled: string[];
  skipped: string[];
  failed: PortalStatusFieldProgressFailedEntry[];
};

/** Aggregate counts for logs / payload_safe (no ids required). */
export type PortalStatusFieldProgressCounts = {
  filled: number;
  skipped: number;
  failed: number;
};

/**
 * Durable STATUS checkpoint JSON on `bls_workflow_tasks.portal_checkpoint_json`
 * (02-database.md / REQ-015). `portalStatus` lives on the sibling column.
 */
export type PortalStatusCheckpoint = {
  lastCompletedStep: PortalStatusCheckpointStep;
  locationId?: string;
  visaTypeId?: string;
  applicantId: string;
  fieldProgress: PortalStatusFieldProgress;
  memberBranch?: PortalStatusMemberBranch;
};

/**
 * Partial update from pipeline transitions (REQ-010).
 * Never includes field values or secrets.
 */
export type PortalStatusCheckpointPatch = {
  portalStatus?: BlsApplicantPortalStatus;
  lastCompletedStep?: PortalStatusCheckpointStep;
  locationId?: string;
  visaTypeId?: string;
  fieldProgress?: PortalStatusFieldProgress;
  memberBranch?: PortalStatusMemberBranch;
};

/** Async sink so the status client can persist without coupling fill to TypeORM. */
export type PortalStatusCheckpointCallbacks = {
  onCheckpoint?: (patch: PortalStatusCheckpointPatch) => Promise<void>;
};

/** Loaded task portal columns (null = resume-from-scrape). */
export type LoadPortalStatusCheckpointResult = {
  portalStatus: BlsApplicantPortalStatus | null;
  checkpoint: PortalStatusCheckpoint | null;
};

/**
 * Persist portal_checkpoint_json; optionally portal_status when known
 * (scrape write times — REQ-018).
 */
export type SavePortalStatusCheckpointInput = {
  taskId: string;
  /** When omitted, only `portal_checkpoint_json` is updated. */
  portalStatus?: BlsApplicantPortalStatus;
  checkpoint: PortalStatusCheckpoint;
};

