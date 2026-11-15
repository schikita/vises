export type ResolveUpsertCreateClientIdInput = {
  /** Trimmed body.clientId when non-empty; otherwise null. */
  requestedClientId: string | null;
  /** True when a Client row exists for requestedClientId. */
  clientExists: boolean;
  /** Staff create without clientId may mint a new CRM Client. */
  isStaff: boolean;
};

export type ResolveUpsertCreateClientIdResult =
  | { action: 'use_existing'; clientId: string }
  | { action: 'create_new' };
