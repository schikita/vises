import {
  PORTAL_BOOKING_FIELD_ID,
  PORTAL_BOOKING_FIELD_PROGRESS_STATUS,
  PORTAL_BOOKING_MEMBERS_COUNT,
  PORTAL_BOOKING_SELECTORS,
} from '../constants';
import type {
  PortalBookingFieldProgress,
  PortalBookingPrefillHint,
  PortalBookingPrefillOutcome,
  PortalPage,
} from '../types';
import { acceptPortalFamilyDisclaimerModal } from './accept-portal-family-disclaimer-modal.util';
import { commitBookingDropdownByLabel } from './commit-booking-dropdown-by-label.util';
import { formatPortalBookingMembersOption } from './format-portal-booking-members-option.util';
import { resolvePortalBookingCategoryOption } from './resolve-portal-booking-category-option.util';
import { selectPortalBookingAppointmentFor } from './select-portal-booking-appointment-for.util';
import { waitForPortalBookingMembersLabel } from './wait-for-portal-booking-members-label.util';
import { waitForPortalOverlaysClear } from './wait-for-portal-overlays-clear.util';

/**
 * Prefill Visa Type Selection fields via labels / listbox UI when CRM maps
 * unambiguously (REQ-010 / REQ-011 / REQ-020 / DEC-006 / DEC-007).
 * Family → Accept `#familyDisclaimer` then Number Of Members.
 * Prefer Normal category; Premium CRM → staff stop (never Accept Premium).
 * Never guesses; never clicks Submit / Premium Lounge Accept.
 */
export const prefillPortalBookingSelectionFields = async (
  page: PortalPage,
  hint: PortalBookingPrefillHint,
): Promise<PortalBookingPrefillOutcome> => {
  const notes: string[] = [];
  const fieldProgress: PortalBookingFieldProgress = {};

  let locationPrefillAttempted = false;
  let locationPrefillApplied = false;
  let visaTypePrefillAttempted = false;
  let visaTypePrefillApplied = false;
  let visaSubTypePrefillAttempted = false;
  let visaSubTypePrefillApplied = false;
  let appointmentForPrefillAttempted = false;
  let appointmentForPrefillApplied = false;
  let numberOfMembersPrefillAttempted = false;
  let numberOfMembersPrefillApplied = false;
  let categoryPrefillAttempted = false;
  let categoryPrefillApplied = false;
  let familyDisclaimerAccepted = false;
  let premiumRequiredStaffStop = false;
  let ambiguous = false;

  const submitCity = hint.submitCity?.trim() ?? '';
  const visaType = hint.visaType?.trim() ?? '';
  const visaSubType = hint.visaSubType?.trim() ?? '';
  const applicantCount =
    typeof hint.applicantCount === 'number' &&
    Number.isFinite(hint.applicantCount)
      ? Math.max(0, Math.floor(hint.applicantCount))
      : 0;

  const settleOverlays = async (): Promise<void> => {
    await waitForPortalOverlaysClear(page);
  };

  // Location
  if (submitCity) {
    locationPrefillAttempted = true;
    await settleOverlays();
    const loc = await commitBookingDropdownByLabel(
      page,
      PORTAL_BOOKING_SELECTORS.locationLabelText,
      submitCity,
    );
    if (loc.ok) {
      locationPrefillApplied = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.location] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
      notes.push('prefill_applied_location');
    } else {
      ambiguous = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.location] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      notes.push(`prefill_location_failed:${loc.reason ?? 'unknown'}`);
    }
  } else {
    notes.push('prefill_skip_empty_location');
    fieldProgress[PORTAL_BOOKING_FIELD_ID.location] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.SKIPPED;
  }

  // Visa Type
  if (visaType) {
    visaTypePrefillAttempted = true;
    await settleOverlays();
    const visa = await commitBookingDropdownByLabel(
      page,
      PORTAL_BOOKING_SELECTORS.visaTypeLabelText,
      visaType,
    );
    if (visa.ok) {
      visaTypePrefillApplied = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.visaType] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
      notes.push('prefill_applied_visa_type');
    } else {
      ambiguous = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.visaType] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      notes.push(`prefill_visa_type_failed:${visa.reason ?? 'unknown'}`);
    }
  } else {
    notes.push('prefill_skip_empty_visa_type');
    fieldProgress[PORTAL_BOOKING_FIELD_ID.visaType] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.SKIPPED;
  }

  // Visa Sub Type (after Visa Type so datasource can populate)
  if (visaSubType) {
    visaSubTypePrefillAttempted = true;
    await settleOverlays();
    const sub = await commitBookingDropdownByLabel(
      page,
      PORTAL_BOOKING_SELECTORS.visaSubTypeLabelText,
      visaSubType,
    );
    if (sub.ok) {
      visaSubTypePrefillApplied = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.visaSubType] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
      notes.push('prefill_applied_visa_sub_type');
    } else {
      ambiguous = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.visaSubType] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      notes.push(`prefill_visa_sub_type_failed:${sub.reason ?? 'unknown'}`);
    }
  } else {
    notes.push('prefill_skip_empty_visa_sub_type');
    fieldProgress[PORTAL_BOOKING_FIELD_ID.visaSubType] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.SKIPPED;
  }

  // Appointment For + Family Accept + Number Of Members
  if (applicantCount === 1) {
    appointmentForPrefillAttempted = true;
    await settleOverlays();
    const appt = await selectPortalBookingAppointmentFor(page, 'Individual');
    if (appt.ok && appt.applied) {
      appointmentForPrefillApplied = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.appointmentFor] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
      notes.push(`prefill_appointment_for_individual via=${appt.via}`);
    } else {
      ambiguous = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.appointmentFor] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      notes.push(
        `prefill_appointment_for_individual_failed:${!appt.ok ? appt.error : 'not_applied'}`,
      );
    }
    fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.SKIPPED;
    notes.push('prefill_number_of_members_skipped_individual');
  } else if (
    applicantCount >= PORTAL_BOOKING_MEMBERS_COUNT.MIN &&
    applicantCount <= PORTAL_BOOKING_MEMBERS_COUNT.MAX
  ) {
    appointmentForPrefillAttempted = true;
    await settleOverlays();
    const appt = await selectPortalBookingAppointmentFor(page, 'Family');
    if (!appt.ok || !appt.applied) {
      ambiguous = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.appointmentFor] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      notes.push(
        `prefill_appointment_for_family_failed:${!appt.ok ? appt.error : 'not_applied'}`,
      );
    } else {
      appointmentForPrefillApplied = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.appointmentFor] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
      notes.push(`prefill_appointment_for_family via=${appt.via}`);

      const family = await acceptPortalFamilyDisclaimerModal(page);
      if (!family.ok) {
        ambiguous = true;
        fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
          PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
        notes.push(`prefill_family_disclaimer_failed:${family.error}`);
      } else {
        if (family.accepted) {
          familyDisclaimerAccepted = true;
          notes.push(
            `prefill_family_disclaimer_accepted via=${family.via ?? 'Accept'}`,
          );
        } else {
          notes.push('prefill_family_disclaimer_not_presented');
        }

        numberOfMembersPrefillAttempted = true;
        const membersVisible = await waitForPortalBookingMembersLabel(page);
        if (!membersVisible) {
          ambiguous = true;
          fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
            PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
          notes.push('prefill_number_of_members_not_visible');
        } else {
          await settleOverlays();
          const membersLabel = formatPortalBookingMembersOption(applicantCount);
          const members = await commitBookingDropdownByLabel(
            page,
            PORTAL_BOOKING_SELECTORS.numberOfMembersLabelText,
            membersLabel,
          );
          if (members.ok) {
            numberOfMembersPrefillApplied = true;
            fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
              PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
            notes.push('prefill_applied_number_of_members');
          } else {
            ambiguous = true;
            fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
              PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
            notes.push(
              `prefill_number_of_members_failed:${members.reason ?? 'unknown'}`,
            );
          }
        }
      }
    }
  } else if (applicantCount > PORTAL_BOOKING_MEMBERS_COUNT.MAX) {
    appointmentForPrefillAttempted = true;
    ambiguous = true;
    fieldProgress[PORTAL_BOOKING_FIELD_ID.appointmentFor] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
    fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
    notes.push('prefill_appointment_for_members_out_of_range');
  } else {
    notes.push('prefill_skip_appointment_for_no_count');
    fieldProgress[PORTAL_BOOKING_FIELD_ID.appointmentFor] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.SKIPPED;
    fieldProgress[PORTAL_BOOKING_FIELD_ID.numberOfMembers] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.SKIPPED;
  }

  // Category — Prefer Normal; Premium CRM → staff stop (DEC-006)
  categoryPrefillAttempted = true;
  const categoryPlan = resolvePortalBookingCategoryOption(hint.category);
  if (categoryPlan.kind === 'premium_staff_stop') {
    premiumRequiredStaffStop = true;
    ambiguous = true;
    fieldProgress[PORTAL_BOOKING_FIELD_ID.category] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
    notes.push('prefill_category_premium_staff_stop');
  } else if (categoryPlan.kind === 'ambiguous') {
    ambiguous = true;
    fieldProgress[PORTAL_BOOKING_FIELD_ID.category] =
      PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
    notes.push('prefill_category_ambiguous');
  } else {
    await settleOverlays();
    const cat = await commitBookingDropdownByLabel(
      page,
      PORTAL_BOOKING_SELECTORS.categoryLabelText,
      categoryPlan.text,
    );
    if (cat.ok) {
      categoryPrefillApplied = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.category] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FILLED;
      notes.push(
        `prefill_applied_category_${categoryPlan.text.toLowerCase().replace(/\s+/g, '_')}`,
      );
    } else {
      ambiguous = true;
      fieldProgress[PORTAL_BOOKING_FIELD_ID.category] =
        PORTAL_BOOKING_FIELD_PROGRESS_STATUS.FAILED;
      notes.push(`prefill_category_failed:${cat.reason ?? 'unknown'}`);
    }
  }

  return {
    locationPrefillAttempted,
    locationPrefillApplied,
    visaTypePrefillAttempted,
    visaTypePrefillApplied,
    visaSubTypePrefillAttempted,
    visaSubTypePrefillApplied,
    appointmentForPrefillAttempted,
    appointmentForPrefillApplied,
    numberOfMembersPrefillAttempted,
    numberOfMembersPrefillApplied,
    categoryPrefillAttempted,
    categoryPrefillApplied,
    familyDisclaimerAccepted,
    premiumRequiredStaffStop,
    ambiguous,
    fieldProgress,
    notes,
  };
};
