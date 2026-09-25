/**
 * Terminal Mail.tm schedule + due purge outcomes
 * (portal-credential-reveal DEC-004 / DEC-005 / DEC-009).
 * Never includes tokens, passwords, or DEK material.
 */

export type BlsWorkflowTerminalCleanupInput = {
  workflowId: string;
};

/** Schedule-only result after eligible terminal (no immediate delete/purge). */
export type BlsWorkflowTerminalCleanupResult = {
  /** True when mailboxCleanupDueAt was set or already present. */
  scheduled: boolean;
  /** ISO due-at when scheduled; null when skipped / soft-fail. */
  mailboxCleanupDueAt: string | null;
};

export type BlsWorkflowEventsRetentionPurgeResult = {
  deletedCount: number;
};

/** Soft-fail due-mailbox tick outcome (REQ-007–009). */
export type BlsWorkflowDueMailboxPurgeResult = {
  processedCount: number;
  mailboxesDeleted: number;
  vaultRowsPurged: number;
  orphansReconciled: number;
};
