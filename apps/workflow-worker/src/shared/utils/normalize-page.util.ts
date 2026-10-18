/** Clamp 1-based page index; invalid / non-positive values become `1`. */
export const normalizePage = (raw: unknown): number => {
  const parsed =
    typeof raw === 'number'
      ? raw
      : Number.parseInt(String(raw ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};
