import {
  TEMPORARY_EMAIL_DATA_PROTECTION_CONSENT_CTA_TEXT,
  TEMPORARY_EMAIL_DATA_PROTECTION_DISAGREE_CTA_TEXT,
} from '../constants';
import { normalizeTemporaryEmailHtmlText } from './normalize-temporary-email-html-text.util';

/** Allow whitespace inside closing `</a >` (fixture splits `</a` / `>` across lines). */
const ANCHOR_TAG_SOURCE = '<a\\b([^>]*)>([\\s\\S]*?)<\\/a\\s*>';
const HREF_ATTR_PATTERN = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

const stripHtmlTags = (value: string): string =>
  value.replace(/<[^>]+>/g, ' ');

const decodeBasicHtmlEntities = (value: string): string =>
  value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const readAnchorHref = (attributeChunk: string): string | null => {
  const match = attributeChunk.match(HREF_ATTR_PATTERN);
  if (!match) {
    return null;
  }
  const raw = (match[1] ?? match[2] ?? match[3] ?? '').trim();
  if (raw.length === 0) {
    return null;
  }
  return decodeBasicHtmlEntities(raw);
};

/**
 * From a data-protection email HTML body, return the green consent CTA href.
 * Never returns the disagree CTA href. Never logs body or href query secrets.
 */
export const extractDataProtectionConsentHref = (
  body: string,
): string | null => {
  if (!body || body.length === 0) {
    return null;
  }

  const consentNeedle = normalizeTemporaryEmailHtmlText(
    TEMPORARY_EMAIL_DATA_PROTECTION_CONSENT_CTA_TEXT,
  );
  const disagreeNeedle = normalizeTemporaryEmailHtmlText(
    TEMPORARY_EMAIL_DATA_PROTECTION_DISAGREE_CTA_TEXT,
  );

  const anchorPattern = new RegExp(ANCHOR_TAG_SOURCE, 'gi');
  let match: RegExpExecArray | null = anchorPattern.exec(body);
  while (match) {
    const attrs = match[1] ?? '';
    const innerHtml = match[2] ?? '';
    const visible = normalizeTemporaryEmailHtmlText(stripHtmlTags(innerHtml));
    const href = readAnchorHref(attrs);

    if (
      href &&
      visible.includes(consentNeedle) &&
      !visible.includes(disagreeNeedle)
    ) {
      return href;
    }

    match = anchorPattern.exec(body);
  }

  return null;
};
