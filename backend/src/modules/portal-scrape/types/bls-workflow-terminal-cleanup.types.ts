/**
 * Terminal Mail.tm + vault cleanup outcomes (REQ-016 / DEC-007 / DEC-020).
 * Never includes tokens, passwords, or DEK material.
 */

export type BlsWorkflowTerminalCleanupInput = {
  workflowId: string;
};

export type BlsWorkflowTerminalCleanupResult = {
  /** Soft-fail Mail.tm delete attempted when vaulted credentials existed. */
  mailboxDeleteAttempted: boolean;
  mailboxDeleted: boolean;
  /** Soft-fail detail; never includes token/password. */
  mailboxDeleteWarn?: string;
  vaultRowsPurged: number;
};

export type BlsWorkflowEventsRetentionPurgeResult = {
  deletedCount: number;
};
