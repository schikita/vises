/**
 * Inbox list row identity for baseline / excludeMessageIds (DEC-001).
 * `rowId` is also returned as wait `messageId` (not a post-open body hash).
 */
export type BrowserMailInboxRow = {
  rowId: string;
  /** Zero-based DOM order under `div.inbox` (smallest = newest / top). */
  index: number;
  /** Short non-secret preview for diagnostics — never log full row text at info. */
  subjectPreview?: string;
};

/** Raw DOM attributes collected in-page before Node-side rowId derive. */
export type BrowserMailInboxRowDomAttrs = {
  index: number;
  onclick: string;
  href: string;
  rowText: string;
};

/** Inputs for stable rowId derivation (DEC-001). */
export type BrowserMailRowIdSource = {
  onclick?: string | null;
  href?: string | null;
  rowText: string;
};
