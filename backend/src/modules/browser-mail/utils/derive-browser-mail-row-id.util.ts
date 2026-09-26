import { createHash } from 'crypto';
import type { BrowserMailRowIdSource } from '../types';

/**
 * Stable inbox row id for baseline + excludeMessageIds (DEC-001).
 * Primary: `mail/…` path from onclick / href; fallback: SHA-256 of row text (24 hex).
 */
export const deriveBrowserMailRowId = (
  source: BrowserMailRowIdSource,
): string => {
  const candidates = [source.onclick ?? '', source.href ?? ''];
  for (const raw of candidates) {
    const match = raw.match(/mail\/[^'"\s)]+/i);
    if (match?.[0]) {
      return match[0].replace(/\/+$/, '').trim().toLowerCase();
    }
  }

  const text = source.rowText.trim();
  return createHash('sha256').update(text).digest('hex').slice(0, 24);
};
