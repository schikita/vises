/**
 * Shared portal_autofill_runs persistence for HTTP autofill + workflow REGISTER
 * soft link (REQ-026 / DEC-012). Never carries secrets.
 */

/** Ensure / create a linked run for a REGISTER step (soft link only). */
export type EnsureWorkflowLinkedAutofillRunInput = {
  workflowId: string;
  stepId: string;
  applicationId: string;
  applicantId: string;
};

/** Linked run + managed evidence paths under UPLOAD_DIR. */
export type EnsureWorkflowLinkedAutofillRunResult = {
  runId: string;
  relativePath: string;
  absolutePath: string;
  /** True when a new row was inserted (vs reclaimed in_progress link). */
  created: boolean;
};

/** Terminal patch for `portal_autofill_runs` (no field values / secrets). */
export type PersistPortalAutofillRunTerminalInput = {
  runId: string;
  status: string;
  captureStatus: string;
  reportOk: boolean;
  screenshotRelativePath?: string | null;
  errorNote?: string | null;
  terminalReason?: string | null;
};
