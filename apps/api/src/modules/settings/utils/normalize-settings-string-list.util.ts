/** Trim, drop empties, and de-dupe settings city/destination lists. */
export const normalizeSettingsStringList = (values: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
};
