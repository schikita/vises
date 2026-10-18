/** Trim + lower-case identity for login/email match (REQ-003, CON-004). */
export const normalizeClientIdentity = (raw: string): string =>
  raw.trim().toLowerCase();
