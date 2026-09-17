/**
 * Sticky session username for backbone mode (DEC-008).
 * Appends `-session-<leaseToken>` so concurrent leases approximate distinct exits.
 */
export const buildBackboneStickyUsername = (
  username: string,
  leaseToken: string,
): string => `${username}-session-${leaseToken}`;
