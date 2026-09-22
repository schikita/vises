import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type {
  PortalBookingPrefillHint,
  PortalBookingPrefillOutcome,
  PortalPage,
} from '../types';

type PrefillArg = {
  locationLabelText: string;
  visaTypeLabelText: string;
  appointmentForLabelText: string;
  individualValue: string;
  familyValue: string;
  modalLocationId: string;
  modalVisaTypeId: string;
  submitCity: string;
  visaType: string;
  applicantCount: number;
};

type PrefillEvalResult = {
  locationPrefillAttempted: boolean;
  locationPrefillApplied: boolean;
  visaTypePrefillAttempted: boolean;
  visaTypePrefillApplied: boolean;
  appointmentForPrefillAttempted: boolean;
  appointmentForPrefillApplied: boolean;
  ambiguous: boolean;
  notes: string[];
};

/**
 * Optionally prefill Location / Visa Type / Appointment For when CRM maps
 * unambiguously onto visible portal options (REQ-030 / DEC-011).
 * Never guesses; never clicks Submit / Premium Lounge Accept.
 */
export const prefillPortalBookingSelectionFields = async (
  page: PortalPage,
  hint: PortalBookingPrefillHint,
): Promise<PortalBookingPrefillOutcome> => {
  const arg: PrefillArg = {
    locationLabelText: PORTAL_BOOKING_SELECTORS.locationLabelText,
    visaTypeLabelText: PORTAL_BOOKING_SELECTORS.visaTypeLabelText,
    appointmentForLabelText: PORTAL_BOOKING_SELECTORS.appointmentForLabelText,
    individualValue: PORTAL_BOOKING_SELECTORS.individualRadioValue,
    familyValue: PORTAL_BOOKING_SELECTORS.familyRadioValue,
    modalLocationId: PORTAL_BOOKING_SELECTORS.modalLocationInputId,
    modalVisaTypeId: PORTAL_BOOKING_SELECTORS.modalVisaTypeInputId,
    submitCity: hint.submitCity?.trim() ?? '',
    visaType: hint.visaType?.trim() ?? '',
    applicantCount:
      typeof hint.applicantCount === 'number' &&
      Number.isFinite(hint.applicantCount)
        ? Math.max(0, Math.floor(hint.applicantCount))
        : 0,
  };

  return page.evaluate((a: PrefillArg): PrefillEvalResult => {
    const notes: string[] = [];
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();

    const isDisplayed = (el: Element | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      if (Number(style.opacity) === 0) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    type OptionRow = { value: string; text: string };

    const readOptions = (input: HTMLElement): OptionRow[] => {
      const w = window as unknown as {
        jQuery?: (el: Element) => {
          data: (key: string) =>
            | {
                dataSource?: { data: () => Array<{ Name?: string; Id?: string; Value?: string }> };
                text: (t?: string) => string | void;
                value: (v?: string) => string | void;
              }
            | undefined;
        };
      };

      if (w.jQuery) {
        const widget = w.jQuery(input).data('kendoDropDownList');
        if (widget?.dataSource?.data) {
          try {
            const rows = widget.dataSource.data() ?? [];
            return rows
              .map((row) => ({
                value: String(row.Id ?? row.Value ?? ''),
                text: String(row.Name ?? ''),
              }))
              .filter((o) => o.text.trim().length > 0);
          } catch {
            /* fall through */
          }
        }
      }

      if (input instanceof HTMLSelectElement) {
        return Array.from(input.options)
          .map((o) => ({ value: o.value, text: o.text }))
          .filter((o) => o.text.trim().length > 0 && !collapse(o.text).includes('select'));
      }

      return [];
    };

    const setDropdown = (
      input: HTMLElement,
      matchText: string,
    ): boolean => {
      const w = window as unknown as {
        jQuery?: (el: Element) => {
          data: (key: string) =>
            | {
                text: (t?: string) => string | void;
                value: (v?: string) => string | void;
                dataSource?: {
                  data: () => Array<{ Name?: string; Id?: string; Value?: string }>;
                };
              }
            | undefined;
        };
      };

      const options = readOptions(input);
      const needle = collapse(matchText);
      const matches = options.filter((o) => collapse(o.text) === needle);
      if (matches.length !== 1) {
        return false;
      }
      const chosen = matches[0];

      if (w.jQuery) {
        const widget = w.jQuery(input).data('kendoDropDownList');
        if (widget) {
          try {
            widget.text(chosen.text);
          } catch {
            try {
              widget.value(chosen.value);
            } catch {
              return false;
            }
          }
          const after =
            typeof widget.text === 'function'
              ? String(widget.text() ?? '')
              : '';
          return collapse(after) === needle;
        }
      }

      if (input instanceof HTMLSelectElement) {
        for (let i = 0; i < input.options.length; i++) {
          if (collapse(input.options[i].text) === needle) {
            input.selectedIndex = i;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      }

      if (input instanceof HTMLInputElement) {
        input.value = chosen.value || chosen.text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }

      return false;
    };

    const discoverVisibleInputs = (labelText: string): HTMLElement[] => {
      const needle = collapse(labelText);
      const labels = Array.from(document.querySelectorAll('label'));
      const inputs: HTMLElement[] = [];

      for (const lab of labels) {
        if (!isDisplayed(lab)) continue;
        if (!collapse(lab.textContent ?? '').includes(needle)) continue;

        const forId = lab.getAttribute('for')?.trim();
        if (forId) {
          const byFor = document.getElementById(forId);
          if (byFor instanceof HTMLElement) {
            const wrap = byFor.closest('.mb-3, .col-12, div') ?? byFor.parentElement;
            if (wrap && isDisplayed(wrap)) {
              inputs.push(byFor);
              continue;
            }
          }
        }

        const wrap = lab.closest('.mb-3, .col-12, div');
        const candidate =
          wrap?.querySelector(
            'input[data-role="dropdownlist"], select, input[type="text"]',
          ) ?? null;
        if (candidate instanceof HTMLElement) {
          const parent = candidate.closest('.mb-3, .col-12, div');
          if (parent && isDisplayed(parent)) {
            inputs.push(candidate);
          }
        }
      }

      return inputs;
    };

    let ambiguous = false;
    let locationPrefillAttempted = false;
    let locationPrefillApplied = false;
    let visaTypePrefillAttempted = false;
    let visaTypePrefillApplied = false;
    let appointmentForPrefillAttempted = false;
    let appointmentForPrefillApplied = false;

    const tryPrefillField = (
      labelText: string,
      crmValue: string,
      modalFallbackId: string,
    ): { attempted: boolean; applied: boolean } => {
      if (!crmValue) {
        notes.push(`prefill_skip_empty_${collapse(labelText)}`);
        return { attempted: false, applied: false };
      }

      let inputs = discoverVisibleInputs(labelText);
      const modalEl = document.getElementById(modalFallbackId);
      if (modalEl instanceof HTMLElement && inputs.length === 0) {
        inputs = [modalEl];
      }

      if (inputs.length === 0) {
        notes.push(`prefill_no_control_${collapse(labelText)}`);
        ambiguous = true;
        return { attempted: true, applied: false };
      }

      // Prefer a single visible control; multiple decoys → try each until
      // exactly one option match applies on a control.
      let applied = false;
      let anyExactOption = false;
      for (const input of inputs) {
        const options = readOptions(input);
        const matches = options.filter(
          (o) => collapse(o.text) === collapse(crmValue),
        );
        if (matches.length === 1) {
          anyExactOption = true;
          if (setDropdown(input, crmValue)) {
            applied = true;
            break;
          }
        } else if (matches.length > 1) {
          ambiguous = true;
          notes.push(`prefill_ambiguous_options_${collapse(labelText)}`);
          return { attempted: true, applied: false };
        }
      }

      if (!anyExactOption) {
        notes.push(`prefill_no_exact_option_${collapse(labelText)}`);
        ambiguous = true;
        return { attempted: true, applied: false };
      }

      if (!applied) {
        notes.push(`prefill_set_failed_${collapse(labelText)}`);
        ambiguous = true;
      } else {
        notes.push(`prefill_applied_${collapse(labelText)}`);
      }
      return { attempted: true, applied };
    };

    const loc = tryPrefillField(
      a.locationLabelText,
      a.submitCity,
      a.modalLocationId,
    );
    locationPrefillAttempted = loc.attempted;
    locationPrefillApplied = loc.applied;

    const visa = tryPrefillField(
      a.visaTypeLabelText,
      a.visaType,
      a.modalVisaTypeId,
    );
    visaTypePrefillAttempted = visa.attempted;
    visaTypePrefillApplied = visa.applied;

    // Appointment For: only Individual when exactly one applicant (unambiguous).
    if (a.applicantCount === 1) {
      appointmentForPrefillAttempted = true;
      const radios = Array.from(
        document.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      const individual = radios.filter(
        (r) =>
          collapse(r.value) === collapse(a.individualValue) &&
          isDisplayed(r.closest('.form-check, div') ?? r),
      );
      if (individual.length === 0) {
        notes.push('prefill_appointment_for_no_individual');
        ambiguous = true;
      } else if (individual.length > 1) {
        // Multiple decoy radios with same value — leave default; still ok if
        // one is already checked.
        const already = individual.filter((r) => r.checked);
        if (already.length === 1) {
          appointmentForPrefillApplied = true;
          notes.push('prefill_appointment_for_already_individual');
        } else {
          notes.push('prefill_appointment_for_decoy_ambiguous');
          ambiguous = true;
        }
      } else {
        individual[0].checked = true;
        individual[0].dispatchEvent(new Event('change', { bubbles: true }));
        appointmentForPrefillApplied = true;
        notes.push('prefill_appointment_for_individual');
      }
    } else if (a.applicantCount > 1) {
      appointmentForPrefillAttempted = true;
      notes.push('prefill_appointment_for_family_ambiguous_skip');
      ambiguous = true;
    }

    return {
      locationPrefillAttempted,
      locationPrefillApplied,
      visaTypePrefillAttempted,
      visaTypePrefillApplied,
      appointmentForPrefillAttempted,
      appointmentForPrefillApplied,
      ambiguous,
      notes,
    };
  }, arg);
};
