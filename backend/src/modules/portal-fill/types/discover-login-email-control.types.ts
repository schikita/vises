/** Result of decoy-aware discovery of the real login Email control (DEC-010). */
export type DiscoverLoginEmailControlResult = {
  ok: boolean;
  /** CSS selector for the chosen input (prefer `#id`, else `[name="…"]`). */
  cssSelector?: string;
  /** How many Email-labeled candidates were scored in the login form. */
  candidateCount?: number;
  reason?: string;
};
