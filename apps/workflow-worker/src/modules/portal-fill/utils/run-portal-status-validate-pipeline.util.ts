import { Logger } from '@nestjs/common';
import {
  BLS_APPLICANT_PORTAL_STATUS,
  EDIT_MEMBER_FIELD_PLAN_ACTION,
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_CHECKPOINT_STEP,
  PORTAL_STATUS_EDIT_SETTLE_MS,
  PORTAL_STATUS_MA_ERROR_CODE,
  PORTAL_STATUS_MEMBER_BRANCH,
} from '../constants';
import type {
  PortalStatusCheckpointPatch,
  RunPortalStatusValidatePipelineOptions,
  RunPortalStatusValidatePipelineResult,
} from '../types';
import { acceptPortalAttentionModal } from './accept-portal-attention-modal.util';
import { areRequiredApplicantsReadyToBook } from './are-required-applicants-ready-to-book.util';
import { clickPortalAddNewMember } from './click-portal-add-new-member.util';
import { clickPortalApplicantEdit } from './click-portal-applicant-edit.util';
import { completePortalVisaTypeModal } from './complete-portal-visa-type-modal.util';
import { ensurePortalAuthenticatedHome } from './ensure-portal-authenticated-home.util';
import { fillPortalApplicantEditForm } from './fill-portal-applicant-edit-form.util';
import { isBlsApplicantPortalStatusReadyToBook } from './is-bls-applicant-portal-status-ready-to-book.util';
import { isPortalApplicantEditFormVisible } from './is-portal-applicant-edit-form-visible.util';
import { isPortalStatusAddFamilyMemberClickAllowed } from './is-portal-status-add-family-member-click-allowed.util';
import { matchPortalApplicantStatusRow } from './match-portal-applicant-status-row.util';
import { matchPortalApplicantStatusRowByName } from './match-portal-applicant-status-row-by-name.util';
import { probePortalStatusMemberFormPathOpen } from './probe-portal-status-member-form-path-open.util';
import { resolvePortalStatusAddFamilyMemberGate } from './resolve-portal-status-add-family-member-gate.util';
import { resolvePortalStatusAddResumeSkip } from './resolve-portal-status-add-resume-skip.util';
import { resolvePortalStatusMemberOpenPath } from './resolve-portal-status-member-open-path.util';
import { resolvePortalStatusResumeEntry } from './resolve-portal-status-resume-entry.util';
import { runPortalLoginPrepPipeline } from './run-portal-login-prep-pipeline.util';
import { scrapePortalApplicantStatusRows } from './scrape-portal-applicant-status-rows.util';
import { submitPortalApplicantEditForm } from './submit-portal-applicant-edit-form.util';
import { waitForPortalAttentionModalHidden } from './wait-for-portal-attention-modal-hidden.util';
import { waitForPortalEditMemberFrameReady } from './wait-for-portal-edit-member-frame-ready.util';
import { waitForPortalManageApplicantsPage } from './wait-for-portal-manage-applicants-page.util';
import { waitForPortalOverlaysClear } from './wait-for-portal-overlays-clear.util';

const logger = new Logger('runPortalStatusValidatePipeline');

/**
 * Persist checkpoint. Resume-critical steps fail the pipeline when durable
 * write fails so retry can trust lastCompletedStep / fieldProgress.
 */
const persistCheckpoint = async (
  onCheckpoint:
    | ((patch: PortalStatusCheckpointPatch) => Promise<void>)
    | undefined,
  patch: PortalStatusCheckpointPatch,
  options?: { required?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (!onCheckpoint) {
    return { ok: true };
  }
  try {
    await onCheckpoint(patch);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const step = patch.lastCompletedStep ?? 'unknown';
    if (options?.required === true) {
      logger.error(
        `checkpoint persist hard-failed step=${step} ${message.slice(0, 200)}`,
      );
      return {
        ok: false,
        error: `checkpoint persist failed at ${step}`,
      };
    }
    logger.warn(
      `checkpoint persist soft-failed step=${step} ${message.slice(0, 200)}`,
    );
    return { ok: true };
  }
};

/**
 * Login → Manage Applicants → scrape/normalize status; when
 * FORM_FILLING_IN_PROGRESS: Edit → visaTypeModal → iframe → Attention →
 * full section fill + Submit dialog → re-scrape. Pre-start extras (OQ-005):
 * Add New Member when gate + Phase B allow, then same fill path with
 * applicant-scoped `memberBranch: ADD_NEW_MEMBER`. READY_TO_BOOK only is
 * success and hands off to BOOK via BOOKING_ENTRY (REQ-001/003/013/014/025/026).
 */
export const runPortalStatusValidatePipeline = async (
  options: RunPortalStatusValidatePipelineOptions,
): Promise<RunPortalStatusValidatePipelineResult> => {
  const logPrefix = options.logPrefix ?? 'portal-status-validate';
  const notes: string[] = [];

  const login = await runPortalLoginPrepPipeline({
    page: options.page,
    portalFormEmail: options.portalFormEmail,
    captchaServiceApiKey: options.captchaServiceApiKey,
    captchaProvider: options.captchaProvider,
    logPrefix: `${logPrefix}/login`,
    submitPassword: true,
    portalPassword: options.portalPassword,
    abortSignal: options.abortSignal,
  });
  notes.push(...login.notes);

  if (!login.ok || login.loginAuthenticatedVerified !== true) {
    const error =
      login.error?.slice(0, 500) ?? 'login before status validate failed';
    logger.error(`${logPrefix} phase=login failure ${error}`);
    return {
      ok: false,
      submitAmbiguous:
        login.passwordSubmitAmbiguous === true ||
        login.passwordSubmitted === true,
      error,
      ...(login.errorCode ? { errorCode: login.errorCode } : {}),
      notes,
    };
  }

  notes.push('authenticated landing before status validate');
  logger.log(`${logPrefix} phase=login success`);

  const authPersist = await persistCheckpoint(options.onCheckpoint, {
    lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.AUTHENTICATED,
  });
  if (!authPersist.ok) {
    return { ok: false, error: authPersist.error, notes };
  }
  if (options.priorCheckpoint?.lastCompletedStep) {
    notes.push(
      `prior_checkpoint_step=${options.priorCheckpoint.lastCompletedStep}`,
    );
  }

  // SE-T06: ensure authenticated home before Manage Applicants (no Book Now).
  logger.log(`${logPrefix} phase=ensure_home start`);
  const home = await ensurePortalAuthenticatedHome(options.page, {
    homeUrl: options.homeUrl,
  });
  notes.push(...home.notes);
  if (!home.ok) {
    logger.error(
      `${logPrefix} phase=ensure_home failure code=${home.errorCode} ${home.error}`,
    );
    return {
      ok: false,
      error: home.error,
      errorCode: home.errorCode,
      notes,
    };
  }
  notes.push('authenticated home recognized before status validate');
  logger.log(`${logPrefix} phase=ensure_home success`);

  try {
    await options.page.goto(options.manageApplicantsUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PORTAL_NAV_TIMEOUT_MS,
    });
  } catch (err) {
    const error = `manage applicants navigation failed: ${
      err instanceof Error ? err.message : String(err)
    }`;
    logger.error(`${logPrefix} phase=navigate failure ${error}`);
    const unreachableResume = resolvePortalStatusResumeEntry({
      liveStatus: null,
      lastCompletedStep:
        options.priorCheckpoint?.lastCompletedStep ?? null,
      pageReachable: false,
    });
    notes.push(
      `resume_entry=${unreachableResume.resumeEntry} hint=${unreachableResume.resumeHint} stored=${unreachableResume.usedStoredCheckpoint}`,
    );
    return {
      ok: false,
      error,
      errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_PAGE_NOT_READY,
      notes,
    };
  }
  notes.push('navigated to Manage Applicants');

  const pageReady = await waitForPortalManageApplicantsPage(options.page);
  if (!pageReady.ok) {
    logger.error(`${logPrefix} phase=page_ready failure ${pageReady.error}`);
    const unreachableResume = resolvePortalStatusResumeEntry({
      liveStatus: null,
      lastCompletedStep:
        options.priorCheckpoint?.lastCompletedStep ?? null,
      pageReachable: false,
    });
    notes.push(
      `resume_entry=${unreachableResume.resumeEntry} hint=${unreachableResume.resumeHint} stored=${unreachableResume.usedStoredCheckpoint}`,
    );
    return {
      ok: false,
      error: pageReady.error,
      errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_PAGE_NOT_READY,
      notes,
    };
  }

  const readMatched = async () => {
    const rows = await scrapePortalApplicantStatusRows(options.page);
    notes.push(`scraped_applicant_rows=${rows.length}`);
    const nameMatched = matchPortalApplicantStatusRowByName({
      rows,
      applicant: options.applicant,
    });
    const statusMatched = matchPortalApplicantStatusRow({
      rows,
      applicant: options.applicant,
    });
    return { rows, nameMatched, statusMatched };
  };

  let { rows, nameMatched, statusMatched } = await readMatched();
  const crmApplicantIds =
    options.crmApplicantIds ?? [options.applicant.applicantId];
  const applicationPrimaryApplicantId =
    crmApplicantIds.find((id) => id.trim().length > 0)?.trim() ??
    options.applicant.applicantId;

  const familyGate = resolvePortalStatusAddFamilyMemberGate({
    crmApplicantIds,
    primaryApplicantId: applicationPrimaryApplicantId,
    portalRowCount: rows.length,
  });
  /**
   * Prefer live gate (CRM + portal row count). When CRM ids are absent,
   * honor an explicit client flag; otherwise use the resolved gate.
   */
  const shouldAddFamilyMembers =
    options.crmApplicantIds !== undefined
      ? familyGate.shouldAddFamilyMembers
      : options.shouldAddFamilyMembers !== undefined
        ? options.shouldAddFamilyMembers
        : familyGate.shouldAddFamilyMembers;
  const addClickAllowed = isPortalStatusAddFamilyMemberClickAllowed({
    shouldAddFamilyMembers,
  });
  const openPath = resolvePortalStatusMemberOpenPath({
    currentApplicantId: options.applicant.applicantId,
    applicationPrimaryApplicantId,
    shouldAddFamilyMembers,
    addClickAllowed,
    pendingPortalAdd: familyGate.pendingPortalAdd,
    nameMatchedRow: nameMatched,
    statusMatchedRow: statusMatched,
  });
  notes.push(...familyGate.gateNotes);
  if (
    options.shouldAddFamilyMembers !== undefined &&
    options.shouldAddFamilyMembers !== familyGate.shouldAddFamilyMembers
  ) {
    notes.push(
      `add_family_gate client_flag=${options.shouldAddFamilyMembers} resolved=${shouldAddFamilyMembers}`,
    );
  }
  notes.push(`add_family_click_allowed=${addClickAllowed}`);
  notes.push(
    `member_open_mode=${openPath.mode} reason=${openPath.reason}`,
  );
  logger.log(
    `${logPrefix} phase=add_family_gate shouldAdd=${shouldAddFamilyMembers} clickAllowed=${addClickAllowed} additional=${familyGate.preStartAdditionalMemberCount} openMode=${openPath.mode}`,
  );

  let matched =
    nameMatched ??
    (openPath.mode === 'EDIT_EXISTING' ? statusMatched : null);

  if (openPath.mode === 'NONE' && matched == null) {
    const error = 'applicant row not found on Manage Applicants';
    logger.error(`${logPrefix} phase=match failure ${error}`);
    return {
      ok: false,
      error,
      errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_APPLICANT_ROW_MISSING,
      notes,
    };
  }

  if (matched != null) {
    notes.push(
      `matched_status=${matched.status} raw=${matched.statusRaw.slice(0, 80)}`,
    );
    logger.log(
      `${logPrefix} phase=scrape status=${matched.status} rowIndex=${matched.rowIndex}`,
    );
  } else {
    notes.push('matched_status=none openMode=ADD_NEW_MEMBER');
    logger.log(
      `${logPrefix} phase=scrape status=none openMode=ADD_NEW_MEMBER portalRows=${rows.length}`,
    );
  }

  const scrapePersist = await persistCheckpoint(
    options.onCheckpoint,
    {
      lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
      ...(matched != null ? { portalStatus: matched.status } : {}),
      ...(openPath.memberBranch !== undefined
        ? { memberBranch: openPath.memberBranch }
        : {}),
    },
    { required: true },
  );
  if (!scrapePersist.ok) {
    return {
      ok: false,
      ...(matched != null
        ? { status: matched.status, statusRaw: matched.statusRaw }
        : {}),
      error: scrapePersist.error,
      notes,
    };
  }

  const resume = resolvePortalStatusResumeEntry({
    liveStatus: matched?.status ?? null,
    lastCompletedStep: options.priorCheckpoint?.lastCompletedStep ?? null,
    pageReachable: true,
  });
  notes.push(
    `resume_entry=${resume.resumeEntry} hint=${resume.resumeHint} stored=${resume.usedStoredCheckpoint}`,
  );
  logger.log(
    `${logPrefix} phase=resume entry=${resume.resumeEntry} hint=${resume.resumeHint}`,
  );

  if (
    matched != null &&
    isBlsApplicantPortalStatusReadyToBook(matched.status)
  ) {
    const gateOk = areRequiredApplicantsReadyToBook({
      statuses: [matched.status],
    });
    if (!gateOk) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        error: 'READY_TO_BOOK gate failed unexpectedly',
        notes,
      };
    }
    // REQ-003: skip form fill → BOOKING_ENTRY handoff to existing BOOK client.
    const bookingPersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.BOOKING_ENTRY,
        portalStatus: matched.status,
      },
      { required: true },
    );
    if (!bookingPersist.ok) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        error: bookingPersist.error,
        notes,
      };
    }
    notes.push('applicant READY_TO_BOOK — skip fill → BOOKING_ENTRY');
    return {
      ok: true,
      readyToBook: true,
      status: matched.status,
      statusRaw: matched.statusRaw,
      notes,
    };
  }

  let editAttempted = false;
  let attentionAccepted = false;
  let formOpened = false;

  if (openPath.mode === 'ADD_NEW_MEMBER') {
    if (!addClickAllowed) {
      notes.push('OPEN_ADD_MEMBER no-op — click not allowed');
      return {
        ok: false,
        error: 'applicant row not found on Manage Applicants',
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_APPLICANT_ROW_MISSING,
        notes,
      };
    }

    editAttempted = true;
    const priorStep = options.priorCheckpoint?.lastCompletedStep;
    const priorAddBranch =
      options.priorCheckpoint?.memberBranch ===
      PORTAL_STATUS_MEMBER_BRANCH.ADD_NEW_MEMBER;
    const checkpointPastOpenAddMember =
      priorAddBranch &&
      priorStep != null &&
      priorStep !== PORTAL_STATUS_CHECKPOINT_STEP.AUTHENTICATED &&
      priorStep !== PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED &&
      priorStep !== PORTAL_STATUS_CHECKPOINT_STEP.OPEN_ADD_MEMBER;

    // Dual-SoT: skip Add only with live visa modal / edit frame / form.
    // Checkpoint past OPEN_ADD_MEMBER alone must not set formOpened.
    const liveFormPath = await probePortalStatusMemberFormPathOpen(
      options.page,
    );
    const addResume = resolvePortalStatusAddResumeSkip({
      checkpointPastOpenAddMember,
      liveVisaModalVisible: liveFormPath.liveVisaModalVisible,
      liveEditFrameReady: liveFormPath.liveEditFrameReady,
      liveEditFormVisible: liveFormPath.liveEditFormVisible,
    });
    notes.push(
      `add_resume reason=${addResume.reason} skip=${addResume.skipAddClick} live_modal=${liveFormPath.liveVisaModalVisible} live_frame=${liveFormPath.liveEditFrameReady} live_form=${liveFormPath.liveEditFormVisible} resume_hint=${resume.resumeHint}`,
    );

    if (addResume.skipAddClick && addResume.treatAsFormOpened) {
      notes.push(
        `resume_skip_add_click live_member_form_path_open prior_step=${priorStep ?? 'none'}`,
      );
      formOpened = true;
    } else {
      const preAddOverlays = await waitForPortalOverlaysClear(options.page);
      if (!preAddOverlays.clear) {
        return {
          ok: false,
          editAttempted,
          error:
            preAddOverlays.reason ?? 'overlays blocking before Add New Member',
          errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_PAGE_NOT_READY,
          notes,
        };
      }

      const addClick = await clickPortalAddNewMember(options.page);
      if (!addClick.ok) {
        logger.error(
          `${logPrefix} phase=add_member_click failure ${addClick.error}`,
        );
        return {
          ok: false,
          editAttempted,
          error: addClick.error,
          errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_APPLICANT_ROW_MISSING,
          notes,
        };
      }
      notes.push(`add new member clicked via=${addClick.via}`);

      const openAddPersist = await persistCheckpoint(
        options.onCheckpoint,
        {
          lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_ADD_MEMBER,
          ...(openPath.memberBranch !== undefined
            ? { memberBranch: openPath.memberBranch }
            : {}),
        },
        { required: true },
      );
      if (!openAddPersist.ok) {
        return {
          ok: false,
          editAttempted,
          error: openAddPersist.error,
          notes,
        };
      }
      formOpened = true;
    }
  } else if (
    openPath.mode === 'EDIT_EXISTING' &&
    matched != null &&
    matched.status === BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS &&
    matched.hasEditAction
  ) {
    editAttempted = true;
    if (
      resume.resumeEntry === PORTAL_STATUS_CHECKPOINT_STEP.FORM_FILLING &&
      options.priorCheckpoint?.fieldProgress
    ) {
      notes.push('resume_form_filling_skip_completed_fieldProgress');
    }

    const preEditOverlays = await waitForPortalOverlaysClear(options.page);
    if (!preEditOverlays.clear) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        error: preEditOverlays.reason ?? 'overlays blocking before Edit',
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_PAGE_NOT_READY,
        notes,
      };
    }

    const editClick = await clickPortalApplicantEdit(options.page, {
      portalApplicantId: matched.portalApplicantId,
      rowIndex: matched.rowIndex,
    });
    if (!editClick.ok) {
      logger.error(`${logPrefix} phase=edit_click failure ${editClick.error}`);
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        error: editClick.error,
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_APPLICANT_ROW_MISSING,
        notes,
      };
    }
    notes.push(`edit clicked via=${editClick.via}`);

    const openEditPersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.OPEN_EDIT,
        portalStatus: matched.status,
        ...(openPath.memberBranch !== undefined
          ? { memberBranch: openPath.memberBranch }
          : {}),
      },
      { required: true },
    );
    if (!openEditPersist.ok) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        error: openEditPersist.error,
        notes,
      };
    }
    formOpened = true;
  }

  if (formOpened) {
    if (!options.editFill?.location?.trim() || !options.editFill?.visaType?.trim()) {
      const error =
        'editFill.location and editFill.visaType required for visaTypeModal';
      logger.error(`${logPrefix} phase=visa_modal failure ${error}`);
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error,
        notes,
      };
    }

    if (options.editFill.nationalVisaVerifyFirst) {
      notes.push('nationalVisaVerifyFirst=true (OQ-003)');
      logger.log(
        `${logPrefix} phase=visa_modal nationalVisaVerifyFirst=true (defer Schengen id assumptions)`,
      );
    }

    const visaModal = await completePortalVisaTypeModal(options.page, {
      location: options.editFill.location,
      visaType: options.editFill.visaType,
    });
    notes.push(...visaModal.notes);
    if (!visaModal.ok) {
      logger.error(`${logPrefix} phase=visa_modal failure ${visaModal.error}`);
      const emptyList =
        /listbox|no items|empty/i.test(visaModal.error) ||
        /LocationId select failed|VisaType select failed/i.test(
          visaModal.error,
        );
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error: visaModal.error,
        errorCode: emptyList
          ? PORTAL_STATUS_MA_ERROR_CODE.MA_LOCATION_VISA_EMPTY
          : PORTAL_STATUS_MA_ERROR_CODE.MA_VISA_TYPE_MODAL_MISSING,
        notes,
      };
    }

    const visaPersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.VISA_TYPE_MODAL,
        ...(matched != null ? { portalStatus: matched.status } : {}),
        ...(visaModal.locationId ? { locationId: visaModal.locationId } : {}),
        ...(visaModal.visaTypeId ? { visaTypeId: visaModal.visaTypeId } : {}),
        ...(openPath.memberBranch !== undefined
          ? { memberBranch: openPath.memberBranch }
          : {}),
      },
      { required: true },
    );
    if (!visaPersist.ok) {
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error: visaPersist.error,
        notes,
      };
    }
    logger.log(`${logPrefix} phase=visa_modal success`);

    const frameReady = await waitForPortalEditMemberFrameReady(options.page);
    if (!frameReady.ok) {
      logger.error(
        `${logPrefix} phase=edit_frame failure ${frameReady.error}`,
      );
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error: frameReady.error,
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_IFRAME_NOT_READY,
        notes,
      };
    }
    const editFrame = frameReady.frame;
    notes.push('edit member iframe ready (#myForm + FirstName)');

    const framePersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.EDIT_FRAME_READY,
        ...(matched != null ? { portalStatus: matched.status } : {}),
        ...(visaModal.locationId ? { locationId: visaModal.locationId } : {}),
        ...(visaModal.visaTypeId ? { visaTypeId: visaModal.visaTypeId } : {}),
        ...(openPath.memberBranch !== undefined
          ? { memberBranch: openPath.memberBranch }
          : {}),
      },
      { required: true },
    );
    if (!framePersist.ok) {
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error: framePersist.error,
        notes,
      };
    }

    const frameOverlays = await waitForPortalOverlaysClear(editFrame);
    if (!frameOverlays.clear) {
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error: frameOverlays.reason ?? 'overlays blocking in edit iframe',
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_IFRAME_NOT_READY,
        notes,
      };
    }

    const attention = await acceptPortalAttentionModal(editFrame);
    if (!attention.ok) {
      logger.error(
        `${logPrefix} phase=attention failure ${attention.error}`,
      );
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        error: attention.error,
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_ATTENTION_STUCK,
        notes,
      };
    }
    attentionAccepted = attention.accepted;
    if (attention.accepted) {
      notes.push(`attention accepted via=${attention.via ?? 'Accept'}`);
      const attentionHidden = await waitForPortalAttentionModalHidden(editFrame);
      if (!attentionHidden.ok) {
        logger.error(
          `${logPrefix} phase=attention_hidden failure ${attentionHidden.error}`,
        );
        return {
          ok: false,
          status: matched?.status,
          statusRaw: matched?.statusRaw,
          editAttempted,
          attentionAccepted,
          error: attentionHidden.error,
          errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_ATTENTION_STUCK,
          notes,
        };
      }
      notes.push('attention modal hidden');
    } else {
      notes.push('attention modal not presented');
    }

    const editVisible = await isPortalApplicantEditFormVisible(editFrame);
    if (!editVisible) {
      const error = 'edit form not visible in iframe after Proceed';
      logger.error(`${logPrefix} phase=edit_form failure ${error}`);
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        error,
        errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_IFRAME_NOT_READY,
        notes,
      };
    }

    if (!options.editFill) {
      const error = 'editFill required for Edit Member form fill';
      logger.error(`${logPrefix} phase=edit_fill failure ${error}`);
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        error,
        notes,
      };
    }

    if (options.editFill.hasUnskippableGaps) {
      const gapIds = options.editFill.fields
        .filter(
          (entry) =>
            entry.action === EDIT_MEMBER_FIELD_PLAN_ACTION.UNSKIPPABLE_GAP,
        )
        .map((entry) => entry.fieldId);
      notes.push(`edit fill unskippableGaps=${gapIds.join(',')}`);
    }

    const filled = await fillPortalApplicantEditForm(editFrame, {
      editFill: options.editFill,
      priorFieldProgress: options.priorCheckpoint?.fieldProgress ?? null,
      onCheckpoint: options.onCheckpoint,
      logPrefix: `${logPrefix}/edit_fill`,
    });
    if (!filled.ok) {
      notes.push(
        `edit fill failed field=${filled.failedFieldId ?? 'unknown'} notSafe=${filled.notSafe === true}`,
      );
      logger.error(
        `${logPrefix} phase=edit_fill failure ${filled.reason.slice(0, 300)}`,
      );
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        error: filled.reason,
        ...(filled.errorCode ? { errorCode: filled.errorCode } : {}),
        notes,
      };
    }
    notes.push(
      `edit fields filled=${filled.filled.length} skipped=${filled.skipped.length}`,
    );
    logger.log(
      `${logPrefix} phase=edit_fill success filled=${filled.filled.length}`,
    );

    const readyPersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.FORM_READY_TO_SUBMIT,
        ...(matched != null ? { portalStatus: matched.status } : {}),
        ...(visaModal.locationId ? { locationId: visaModal.locationId } : {}),
        ...(visaModal.visaTypeId ? { visaTypeId: visaModal.visaTypeId } : {}),
        ...(openPath.memberBranch !== undefined
          ? { memberBranch: openPath.memberBranch }
          : {}),
      },
      { required: true },
    );
    if (!readyPersist.ok) {
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        error: readyPersist.error,
        notes,
      };
    }
    notes.push('checkpoint FORM_READY_TO_SUBMIT');

    // REQ-013: dialog listener before Submit; validation summary clear; Submit enabled.
    const submitted = await submitPortalApplicantEditForm({
      page: options.page,
      formContext: editFrame,
    });
    notes.push(...submitted.notes);
    if (!submitted.ok) {
      logger.error(`${logPrefix} phase=edit_submit failure ${submitted.error}`);
      const validationSummary = /validation summary/i.test(submitted.error);
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        ...(submitted.submitAmbiguous === true
          ? { submitAmbiguous: true }
          : {}),
        error: submitted.error,
        ...(validationSummary
          ? {
              errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_VALIDATION_SUMMARY,
            }
          : {}),
        notes,
      };
    }
    logger.log(
      `${logPrefix} phase=edit_submit via=${submitted.via} dialogAccepted=${submitted.dialogAccepted}`,
    );

    const postSubmitPersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.POST_SUBMIT_RELOAD,
        ...(matched != null ? { portalStatus: matched.status } : {}),
        ...(openPath.memberBranch !== undefined
          ? { memberBranch: openPath.memberBranch }
          : {}),
      },
      { required: true },
    );
    if (!postSubmitPersist.ok) {
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        submitAmbiguous: true,
        error: postSubmitPersist.error,
        notes,
      };
    }
    notes.push('checkpoint POST_SUBMIT_RELOAD');

    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_STATUS_EDIT_SETTLE_MS),
    );

    try {
      await options.page.goto(options.manageApplicantsUrl, {
        waitUntil: 'domcontentloaded',
        timeout: PORTAL_NAV_TIMEOUT_MS,
      });
    } catch {
      notes.push('post-edit re-navigate soft-failed; scraping current page');
    }

    const afterReady = await waitForPortalManageApplicantsPage(options.page);
    if (!afterReady.ok) {
      return {
        ok: false,
        status: matched?.status,
        statusRaw: matched?.statusRaw,
        editAttempted,
        attentionAccepted,
        submitAmbiguous: true,
        error: afterReady.error,
        notes,
      };
    }

    // Ambiguous submit / missed dialog: re-scrape first (VERIFY_THEN_REPEAT).
    const afterSubmit = await readMatched();
    rows = afterSubmit.rows;
    nameMatched = afterSubmit.nameMatched;
    statusMatched = afterSubmit.statusMatched;
    matched = afterSubmit.nameMatched ?? afterSubmit.statusMatched;
    if (!matched) {
      return {
        ok: false,
        editAttempted,
        attentionAccepted,
        submitAmbiguous: true,
        error: 'applicant row missing after edit submit',
        notes,
      };
    }
    notes.push(
      `post_edit_status=${matched.status} raw=${matched.statusRaw.slice(0, 80)}`,
    );

    const postScrapePersist = await persistCheckpoint(
      options.onCheckpoint,
      {
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.STATUS_SCRAPED,
        portalStatus: matched.status,
        ...(openPath.memberBranch !== undefined
          ? { memberBranch: openPath.memberBranch }
          : {}),
      },
      { required: true },
    );
    if (!postScrapePersist.ok) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        submitAmbiguous: true,
        error: postScrapePersist.error,
        notes,
      };
    }

    if (isBlsApplicantPortalStatusReadyToBook(matched.status)) {
      const postBookingPersist = await persistCheckpoint(
        options.onCheckpoint,
        {
          lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.BOOKING_ENTRY,
          portalStatus: matched.status,
          ...(openPath.memberBranch !== undefined
            ? { memberBranch: openPath.memberBranch }
            : {}),
        },
        { required: true },
      );
      if (!postBookingPersist.ok) {
        return {
          ok: false,
          status: matched.status,
          statusRaw: matched.statusRaw,
          editAttempted,
          attentionAccepted,
          error: postBookingPersist.error,
          notes,
        };
      }
      notes.push('applicant READY_TO_BOOK after edit → BOOKING_ENTRY');
      return {
        ok: true,
        readyToBook: true,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        notes,
      };
    }

    // Still Form Filling after confirmed submit → SAFE_TO_REPEAT / bls_status_not_ready.
    if (
      matched.status === BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS &&
      submitted.dialogAccepted
    ) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        error: `status after edit is ${matched.status} (not READY_TO_BOOK)`,
        notes,
      };
    }

    // Missed dialog / unexpected status → VERIFY_THEN_REPEAT (re-scrape already done).
    return {
      ok: false,
      status: matched.status,
      statusRaw: matched.statusRaw,
      editAttempted,
      attentionAccepted,
      submitAmbiguous: true,
      error: `status after edit is ${matched.status} (not READY_TO_BOOK)`,
      notes,
    };
  }

  // UNKNOWN or FORM_FILLING without edit — never success (REQ-004).
  if (matched == null) {
    const error = 'applicant row not found on Manage Applicants';
    logger.error(`${logPrefix} phase=status failure ${error}`);
    return {
      ok: false,
      editAttempted,
      attentionAccepted,
      error,
      errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_APPLICANT_ROW_MISSING,
      notes,
    };
  }

  const isUnknown =
    matched.status === BLS_APPLICANT_PORTAL_STATUS.UNKNOWN;
  const error = isUnknown
    ? `applicant status UNKNOWN (raw=${matched.statusRaw.slice(0, 120)})`
    : `applicant status ${matched.status} — not READY_TO_BOOK`;
  logger.error(`${logPrefix} phase=status failure ${error}`);
  return {
    ok: false,
    status: matched.status,
    statusRaw: matched.statusRaw,
    editAttempted,
    attentionAccepted,
    error,
    ...(isUnknown
      ? {}
      : matched.hasEditAction !== true
        ? {
            errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_APPLICANT_ROW_MISSING,
          }
        : {}),
    notes,
  };
};
