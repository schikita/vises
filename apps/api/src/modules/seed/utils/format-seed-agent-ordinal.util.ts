/** Zero-pad a 1-based agent index to a stable two-digit ordinal. */
export const formatSeedAgentOrdinal = (index: number): string =>
  String(index).padStart(2, '0');
