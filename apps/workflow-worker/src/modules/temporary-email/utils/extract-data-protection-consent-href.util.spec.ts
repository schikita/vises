import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  TEMPORARY_EMAIL_DATA_PROTECTION_DISAGREE_CTA_TEXT,
  TEMPORARY_EMAIL_DATA_PROTECTION_SUBJECT_INCLUDES,
} from '../constants';
import { extractDataProtectionConsentHref } from './extract-data-protection-consent-href.util';
import { temporaryEmailSubjectIncludes } from './temporary-email-subject-includes.util';

/**
 * Fixture assert for VT-TASK-003 (excluded from nest build via *spec.ts).
 * Run: npx --yes tsx src/modules/temporary-email/utils/extract-data-protection-consent-href.util.spec.ts
 */

const fixturePath = join(
  __dirname,
  '../../../../../../site_materials/email_data_protection/mail.html',
);
const fixtureHtml = readFileSync(fixturePath, 'utf8');

assert.ok(
  temporaryEmailSubjectIncludes(
    TEMPORARY_EMAIL_DATA_PROTECTION_SUBJECT_INCLUDES,
    TEMPORARY_EMAIL_DATA_PROTECTION_SUBJECT_INCLUDES,
  ),
);
assert.ok(
  fixtureHtml.includes(TEMPORARY_EMAIL_DATA_PROTECTION_SUBJECT_INCLUDES),
);

const consentHref = extractDataProtectionConsentHref(fixtureHtml);
assert.ok(consentHref, 'expected consent href from fixture');
assert.ok(
  consentHref.includes('dataprotectionemailaccept'),
  'consent href should target dataprotectionemailaccept',
);

assert.ok(
  fixtureHtml.includes(TEMPORARY_EMAIL_DATA_PROTECTION_DISAGREE_CTA_TEXT),
  'fixture should include disagree CTA text',
);

const hrefs: string[] = [];
const hrefPattern =
  /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
let hrefMatch: RegExpExecArray | null = hrefPattern.exec(fixtureHtml);
while (hrefMatch) {
  const value = (hrefMatch[1] ?? hrefMatch[2] ?? '').trim();
  if (value.includes('dataprotectionemailaccept')) {
    hrefs.push(value);
  }
  hrefMatch = hrefPattern.exec(fixtureHtml);
}
assert.equal(hrefs.length, 2, 'fixture should have consent + disagree accept hrefs');
assert.ok(
  hrefs.includes(consentHref),
  'extracted href must be one of the accept links',
);
const disagreeHref = hrefs.find((href) => href !== consentHref);
assert.ok(disagreeHref, 'expected a distinct disagree href');
assert.notEqual(
  consentHref,
  disagreeHref,
  'extractor must not return disagree CTA href',
);

const disagreeOnly = extractDataProtectionConsentHref(
  `<a href="${disagreeHref}">${TEMPORARY_EMAIL_DATA_PROTECTION_DISAGREE_CTA_TEXT}</a>`,
);
assert.equal(disagreeOnly, null, 'disagree-only body must yield null');

assert.equal(extractDataProtectionConsentHref(''), null);
assert.equal(extractDataProtectionConsentHref('<p>no anchors</p>'), null);

console.log('extract-data-protection-consent-href.util.spec.ts: ok');
