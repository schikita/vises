import type { PortalPage } from '../types';
import type { PortalDomContext } from '../types/portal-dom-context.types';
import type { SubmitPortalApplicantEditFormResult } from '../types/portal-edit-submit.types';
import { clickPortalApplicantEditSubmit } from './click-portal-applicant-edit-submit.util';
import { isPortalApplicantEditValidationSummaryClear } from './is-portal-applicant-edit-validation-summary-clear.util';
import { registerPortalEditSubmitDialogListener } from './register-portal-edit-submit-dialog-listener.util';

type SubmitOptions = {
  /** Top page — dialog events surface here even when form is in iframe. */
  page: PortalPage;
  /** Edit Member iframe (or page) containing `#myForm`. */
  formContext: PortalDomContext;
};

/**
 * Pre-submit gates + dialog listener + Edit Submit (REQ-013).
 * Registers the success dialog listener on the top page **before** clicking
 * Submit inside the Edit Member iframe.
 */
export const submitPortalApplicantEditForm = async (
  options: SubmitOptions,
): Promise<SubmitPortalApplicantEditFormResult> => {
  const notes: string[] = [];

  const summary = await isPortalApplicantEditValidationSummaryClear(
    options.formContext,
  );
  if (!summary.clear) {
    notes.push(
      `validation_summary_visible=${(summary.summaryText ?? '').slice(0, 80)}`,
    );
    return {
      ok: false,
      error: 'validation summary visible before Edit Submit',
      notes,
    };
  }
  notes.push('validation_summary_clear');

  const dialogListener = registerPortalEditSubmitDialogListener(options.page);

  try {
    const submitted = await clickPortalApplicantEditSubmit(options.formContext);
    if (!submitted.ok) {
      dialogListener.dispose();
      return {
        ok: false,
        error: submitted.error,
        notes,
      };
    }
    notes.push(`edit submitted via=${submitted.via}`);

    const dialog = await dialogListener.outcome;
    if (dialog.listenerUnavailable === true) {
      notes.push('dialog_listener_unavailable');
      return {
        ok: true,
        via: submitted.via,
        dialogAccepted: false,
        dialogTimedOut: true,
        notes,
      };
    }
    if (dialog.accepted) {
      notes.push('edit_success_dialog_accepted');
      return {
        ok: true,
        via: submitted.via,
        dialogAccepted: true,
        ...(dialog.message ? { dialogMessage: dialog.message } : {}),
        dialogTimedOut: false,
        notes,
      };
    }

    // No success dialog — may still reload (VERIFY_THEN_REPEAT after scrape).
    notes.push(
      dialog.timedOut
        ? 'edit_success_dialog_timed_out'
        : `edit_dialog_unexpected=${(dialog.message ?? '').slice(0, 80)}`,
    );
    return {
      ok: true,
      via: submitted.via,
      dialogAccepted: false,
      ...(dialog.message ? { dialogMessage: dialog.message } : {}),
      dialogTimedOut: dialog.timedOut,
      notes,
    };
  } catch (err) {
    dialogListener.dispose();
    const error = `Edit Submit failed: ${
      err instanceof Error ? err.message : String(err)
    }`;
    return {
      ok: false,
      error,
      submitAmbiguous: true,
      notes,
    };
  }
};
