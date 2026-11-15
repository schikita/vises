import type { EditMemberFillInput } from './edit-member-fill-input.types';
import type {
  PortalStatusCheckpointCallbacks,
  PortalStatusFieldProgress,
} from './portal-status-checkpoint.types';

export type FillPortalApplicantEditFormOptions = {
  editFill: EditMemberFillInput;
  /** Prior filled/skipped/failed ids for resume (REQ-017). */
  priorFieldProgress?: PortalStatusFieldProgress | null;
  onCheckpoint?: PortalStatusCheckpointCallbacks['onCheckpoint'];
  logPrefix?: string;
};

export type FillPortalApplicantEditFormSuccess = {
  ok: true;
  fieldProgress: PortalStatusFieldProgress;
  filled: string[];
  skipped: string[];
};

export type FillPortalApplicantEditFormFailure = {
  ok: false;
  reason: string;
  fieldProgress: PortalStatusFieldProgress;
  /** Staff / NOT_SAFE when CRM gap or unsafe data — do not invent values. */
  notSafe?: boolean;
  errorCode?: string;
  failedFieldId?: string;
};

export type FillPortalApplicantEditFormResult =
  | FillPortalApplicantEditFormSuccess
  | FillPortalApplicantEditFormFailure;
