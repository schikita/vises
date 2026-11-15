import {
  BLS_APPLICANT_PORTAL_STATUS,
  PORTAL_STATUS_CHECKPOINT_STEP,
  PORTAL_STATUS_MA_RESUME_HINT,
} from '../constants';
import type {
  ResolvePortalStatusResumeEntryInput,
  ResolvePortalStatusResumeEntryResult,
} from '../types/resolve-portal-status-resume-entry.types';
import type { PortalStatusCheckpointStep } from '../types/portal-status-checkpoint.types';

const mapStoredStepToResumeEntry = (
  step: PortalStatusCheckpointStep,
): ResolvePortalStatusResumeEntryResult => {
  switch (step) {
    case PORTAL_STATUS_CHECKPOINT_STEP.BOOKING_ENTRY:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.BOOKING_ENTRY,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.BOOKING_ENTRY,
        usedStoredCheckpoint: true,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.POST_SUBMIT_RELOAD:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.STATUS_SCRAPED,
        usedStoredCheckpoint: true,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.FORM_READY_TO_SUBMIT:
    case PORTAL_STATUS_CHECKPOINT_STEP.FORM_FILLING:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.FORM_FILLING,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.FORM_FILLING,
        usedStoredCheckpoint: true,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.EDIT_FRAME_READY:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.REOPEN_EDIT,
        usedStoredCheckpoint: true,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.VISA_TYPE_MODAL:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.VISA_TYPE_MODAL,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.REOPEN_MODAL,
        usedStoredCheckpoint: true,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT:
    case PORTAL_STATUS_CHECKPOINT_STEP.OPEN_ADD_MEMBER:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.OPEN_EDIT,
        usedStoredCheckpoint: true,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED:
    case PORTAL_STATUS_CHECKPOINT_STEP.AUTHENTICATED:
    default:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.STATUS_SCRAPED,
        usedStoredCheckpoint: true,
      };
  }
};

const mapFormFillingResumeFromCheckpoint = (
  step: PortalStatusCheckpointStep | null,
): ResolvePortalStatusResumeEntryResult => {
  if (step == null) {
    return {
      resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
      resumeHint: PORTAL_STATUS_MA_RESUME_HINT.OPEN_EDIT,
      usedStoredCheckpoint: false,
    };
  }

  switch (step) {
    case PORTAL_STATUS_CHECKPOINT_STEP.FORM_FILLING:
    case PORTAL_STATUS_CHECKPOINT_STEP.FORM_READY_TO_SUBMIT:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.FORM_FILLING,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.FORM_FILLING,
        usedStoredCheckpoint: false,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.POST_SUBMIT_RELOAD:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.OPEN_EDIT,
        usedStoredCheckpoint: false,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.EDIT_FRAME_READY:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.REOPEN_EDIT,
        usedStoredCheckpoint: false,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.VISA_TYPE_MODAL:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.VISA_TYPE_MODAL,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.REOPEN_MODAL,
        usedStoredCheckpoint: false,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT:
    case PORTAL_STATUS_CHECKPOINT_STEP.OPEN_ADD_MEMBER:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.OPEN_EDIT,
        usedStoredCheckpoint: false,
      };
    case PORTAL_STATUS_CHECKPOINT_STEP.BOOKING_ENTRY:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.OPEN_EDIT,
        usedStoredCheckpoint: false,
      };
    default:
      return {
        resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        resumeHint: PORTAL_STATUS_MA_RESUME_HINT.OPEN_EDIT,
        usedStoredCheckpoint: false,
      };
  }
};

/**
 * Choose STATUS_VALIDATE resume entry from live scrape + checkpoint
 * (spec §5 SoT: live preferred; stored only when page unreachable).
 */
export const resolvePortalStatusResumeEntry = (
  input: ResolvePortalStatusResumeEntryInput,
): ResolvePortalStatusResumeEntryResult => {
  if (!input.pageReachable) {
    if (input.lastCompletedStep != null) {
      return mapStoredStepToResumeEntry(input.lastCompletedStep);
    }
    return {
      resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
      resumeHint: PORTAL_STATUS_MA_RESUME_HINT.RETRY_PAGE,
      usedStoredCheckpoint: false,
    };
  }

  if (input.liveStatus === BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK) {
    return {
      resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.BOOKING_ENTRY,
      resumeHint: PORTAL_STATUS_MA_RESUME_HINT.BOOKING_ENTRY,
      usedStoredCheckpoint: false,
    };
  }

  if (input.liveStatus === BLS_APPLICANT_PORTAL_STATUS.UNKNOWN) {
    return {
      resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
      resumeHint: PORTAL_STATUS_MA_RESUME_HINT.STATUS_SCRAPED,
      usedStoredCheckpoint: false,
    };
  }

  if (
    input.liveStatus === BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS
  ) {
    return mapFormFillingResumeFromCheckpoint(input.lastCompletedStep);
  }

  return {
    resumeEntry: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
    resumeHint: PORTAL_STATUS_MA_RESUME_HINT.STATUS_SCRAPED,
    usedStoredCheckpoint: false,
  };
};
