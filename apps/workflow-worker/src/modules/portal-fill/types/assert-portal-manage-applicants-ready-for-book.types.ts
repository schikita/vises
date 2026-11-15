/** BOOK Ready gate scrape outcome (this-spec CON-006). */
export type AssertPortalManageApplicantsReadyForBookResult =
  | { ok: true; readyCount: number; notes: string[] }
  | { ok: false; error: string; notes: string[] };
