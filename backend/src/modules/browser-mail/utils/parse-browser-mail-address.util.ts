/**
 * Split `local@domain` into parts for identity restore (REQ-010 / DEC-003).
 * Returns null when the address is not a usable local@domain pair.
 */
export const parseBrowserMailAddress = (
  address: string,
): { localPart: string; domain: string } | null => {
  const trimmed = address.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at >= trimmed.length - 1) {
    return null;
  }
  const localPart = trimmed.slice(0, at).trim();
  const domain = trimmed.slice(at + 1).trim().replace(/^@/, '');
  if (!localPart || !domain) {
    return null;
  }
  return { localPart, domain };
};
