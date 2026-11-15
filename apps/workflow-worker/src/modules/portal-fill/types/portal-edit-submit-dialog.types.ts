/**
 * Edit Member success dialog outcome (REQ-013 / MA-TASK-006).
 * Listener is registered on the top page before iframe Submit.
 */
export type PortalEditSubmitDialogOutcome = {
  /** True when the expected success alert was accepted. */
  accepted: boolean;
  /** Raw dialog message when a dialog fired (truncated). */
  message?: string;
  /** True when no dialog arrived within the wait budget. */
  timedOut: boolean;
  /** True when the page surface lacked dialog listener APIs. */
  listenerUnavailable?: boolean;
};

export type RegisterPortalEditSubmitDialogListenerResult = {
  /** Resolves when the expected dialog is accepted or the wait expires. */
  outcome: Promise<PortalEditSubmitDialogOutcome>;
  /** Detach the listener (idempotent). */
  dispose: () => void;
};
