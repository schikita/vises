/** Result of decoy-aware discovery of the real login Password control (REQ-011). */
export type DiscoverLoginPasswordControlResult = {
  ok: boolean;
  /** CSS selector for the chosen input (prefer `#id`, else `[name="…"]`). */
  cssSelector?: string;
  /** How many Password-labeled candidates were scored. */
  candidateCount?: number;
  reason?: string;
};
