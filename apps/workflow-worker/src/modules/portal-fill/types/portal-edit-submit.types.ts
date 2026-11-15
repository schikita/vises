/**
 * Pre-submit + Submit + dialog handoff for Edit Member (REQ-013).
 */
export type SubmitPortalApplicantEditFormResult =
  | {
      ok: true;
      via: string;
      dialogAccepted: boolean;
      dialogMessage?: string;
      dialogTimedOut: boolean;
      notes: string[];
    }
  | {
      ok: false;
      error: string;
      /** True when Submit may have applied without a confirmed dialog. */
      submitAmbiguous?: boolean;
      notes: string[];
    };
