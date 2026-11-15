/**
 * Collapse HTML/visible whitespace for CTA text comparison. Never logs input.
 */
export const normalizeTemporaryEmailHtmlText = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();
