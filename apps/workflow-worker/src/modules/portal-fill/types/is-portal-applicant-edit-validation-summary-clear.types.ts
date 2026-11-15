/** Pre-submit validation summary probe (REQ-013). */
export type IsPortalApplicantEditValidationSummaryClearResult = {
  clear: boolean;
  /** True when a visible non-empty `.validation-summary.alert-danger` was found. */
  summaryVisible: boolean;
  /** Collapsed summary text when visible (truncated). */
  summaryText?: string;
};
