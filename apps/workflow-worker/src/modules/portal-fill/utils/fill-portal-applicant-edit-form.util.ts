import { Logger } from '@nestjs/common';
import {
  EDIT_MEMBER_FILL_SECTION_ORDER,
  PORTAL_STATUS_CHECKPOINT_STEP,
  PORTAL_STATUS_EDIT_FILL_NOT_SAFE_ERROR_CODE,
  PORTAL_STATUS_FIELD_FAIL_REASON,
  PORTAL_STATUS_MA_ERROR_CODE,
} from '../constants';
import type {
  FillPortalApplicantEditFormOptions,
  FillPortalApplicantEditFormResult,
  PortalWidgetSurface,
} from '../types';
import { fillEditMemberAddressSection } from './fill-edit-member-address-section.util';
import { fillEditMemberCostSection } from './fill-edit-member-cost-section.util';
import { fillEditMemberEmployerSection } from './fill-edit-member-employer-section.util';
import { fillEditMemberFingerprintInvitingSection } from './fill-edit-member-fingerprint-inviting-section.util';
import { fillEditMemberPassportSection } from './fill-edit-member-passport-section.util';
import { fillEditMemberPersonalSection } from './fill-edit-member-personal-section.util';
import { fillEditMemberTravelSection } from './fill-edit-member-travel-section.util';
import { isEditMemberSectionCompleteForResume } from './is-edit-member-section-complete-for-resume.util';
import { seedEditMemberFieldProgress } from './record-edit-member-field-progress.util';
import { verifyEditMemberLiveFormSections } from './verify-edit-member-live-form-sections.util';

const logger = new Logger('fillPortalApplicantEditForm');

const SECTION_FILLERS = {
  personal: fillEditMemberPersonalSection,
  passport: fillEditMemberPassportSection,
  address: fillEditMemberAddressSection,
  employer: fillEditMemberEmployerSection,
  travel: fillEditMemberTravelSection,
  fingerprint_inviting: fillEditMemberFingerprintInvitingSection,
  cost: fillEditMemberCostSection,
} as const;

/**
 * Full Schengen required Edit Member fill inside iframe (REQ-007–012 / REQ-017).
 * Extends STATUS edit pipeline only — no parallel orchestrator (REQ-027).
 */
export const fillPortalApplicantEditForm = async (
  surface: PortalWidgetSurface,
  options: FillPortalApplicantEditFormOptions,
): Promise<FillPortalApplicantEditFormResult> => {
  const logPrefix = options.logPrefix ?? 'portal-edit-fill';
  const editFill = options.editFill;
  let fieldProgress = seedEditMemberFieldProgress(options.priorFieldProgress);
  const priorFilledIds = new Set(fieldProgress.filled);
  const filledAll: string[] = [];
  const skippedAll: string[] = [];

  const persistProgress = async (): Promise<
    { ok: true } | { ok: false; reason: string }
  > => {
    if (!options.onCheckpoint) {
      return { ok: true };
    }
    try {
      await options.onCheckpoint({
        lastCompletedStep: PORTAL_STATUS_CHECKPOINT_STEP.FORM_FILLING,
        fieldProgress: {
          filled: [...fieldProgress.filled],
          skipped: [...fieldProgress.skipped],
          failed: fieldProgress.failed.map((entry) => ({
            fieldId: entry.fieldId,
            reasonCode: entry.reasonCode,
          })),
        },
      });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(
        `${logPrefix} fieldProgress checkpoint hard-failed ${message.slice(0, 200)}`,
      );
      return {
        ok: false,
        reason: 'fieldProgress checkpoint persist failed',
      };
    }
  };

  if (editFill.nationalVisaVerifyFirst) {
    logger.log(
      `${logPrefix} nationalVisaVerifyFirst=true — verifying live form before Schengen ids`,
    );
    const live = await verifyEditMemberLiveFormSections(surface);
    if (!live.ok) {
      logger.warn(`${logPrefix} ${live.reason}`);
      for (const id of live.missingIds) {
        fieldProgress = {
          ...fieldProgress,
          failed: [
            ...fieldProgress.failed.filter((f) => f.fieldId !== id),
            {
              fieldId: id,
              reasonCode: PORTAL_STATUS_FIELD_FAIL_REASON.LIVE_FORM_MISMATCH,
            },
          ],
        };
      }
      const livePersist = await persistProgress();
      if (!livePersist.ok) {
        return {
          ok: false,
          reason: livePersist.reason,
          fieldProgress,
        };
      }
      return {
        ok: false,
        reason: live.reason,
        fieldProgress,
        notSafe: true,
        errorCode: PORTAL_STATUS_EDIT_FILL_NOT_SAFE_ERROR_CODE,
      };
    }
  }

  for (const sectionId of EDIT_MEMBER_FILL_SECTION_ORDER) {
    if (
      isEditMemberSectionCompleteForResume(
        sectionId,
        editFill.fields,
        fieldProgress,
        priorFilledIds,
      )
    ) {
      logger.log(
        `${logPrefix} section=${sectionId} skipped_complete resume_fieldProgress`,
      );
      continue;
    }

    const filler = SECTION_FILLERS[sectionId];
    const sectionResult = await filler({
      surface,
      fields: editFill.fields,
      fieldProgress,
      priorFilledIds,
    });
    fieldProgress = sectionResult.fieldProgress;

    if (!sectionResult.ok) {
      const failPersist = await persistProgress();
      if (!failPersist.ok) {
        return {
          ok: false,
          reason: failPersist.reason,
          fieldProgress,
          ...(sectionResult.failedFieldId
            ? { failedFieldId: sectionResult.failedFieldId }
            : {}),
        };
      }
      logger.warn(
        `${logPrefix} section=${sectionId} failed field=${sectionResult.failedFieldId ?? 'unknown'}`,
      );
      const datepickerFail =
        sectionResult.reasonCode ===
        PORTAL_STATUS_FIELD_FAIL_REASON.STALE_DATEPICKER;
      const validationFail =
        sectionResult.reasonCode ===
        PORTAL_STATUS_FIELD_FAIL_REASON.VALIDATION_SUMMARY;
      return {
        ok: false,
        reason: sectionResult.reason,
        fieldProgress,
        ...(sectionResult.notSafe ? { notSafe: true } : {}),
        ...(sectionResult.notSafe
          ? { errorCode: PORTAL_STATUS_EDIT_FILL_NOT_SAFE_ERROR_CODE }
          : datepickerFail
            ? { errorCode: PORTAL_STATUS_MA_ERROR_CODE.MA_DATEPICKER_FAIL }
            : validationFail
              ? {
                  errorCode:
                    PORTAL_STATUS_MA_ERROR_CODE.MA_VALIDATION_SUMMARY,
                }
              : {}),
        ...(sectionResult.failedFieldId
          ? { failedFieldId: sectionResult.failedFieldId }
          : {}),
      };
    }

    filledAll.push(...sectionResult.filled);
    skippedAll.push(...sectionResult.skipped);
    const sectionPersist = await persistProgress();
    if (!sectionPersist.ok) {
      return {
        ok: false,
        reason: sectionPersist.reason,
        fieldProgress,
      };
    }
    logger.log(
      `${logPrefix} section=${sectionId} filled=${sectionResult.filled.length} skipped=${sectionResult.skipped.length}`,
    );
  }

  return {
    ok: true,
    fieldProgress,
    filled: filledAll,
    skipped: skippedAll,
  };
};
