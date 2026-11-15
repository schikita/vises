import assert from 'node:assert/strict';
import type { Application } from '../../database/entities/application.entity';
import { buildPortalBookingPrefillHint } from './build-portal-booking-prefill-hint.util';

/**
 * APF-TASK-004 booking prefill category / visaSubType checks.
 * Run: npx --yes tsx src/modules/bls-clients/utils/build-portal-booking-prefill-hint.util.spec.ts
 */

const baseApp = (): Application =>
  ({
    id: 'app-1',
    submitCity: 'Warsaw',
    visaType: 'National Visa',
    visaSubType: null,
    extras: null,
  }) as Application;

{
  const hint = buildPortalBookingPrefillHint(baseApp(), 2);

  assert.equal(hint.applicantCount, 2);
  assert.equal(hint.submitCity, 'Warsaw');
  assert.equal(hint.visaType, 'National Visa');
  assert.equal(
    Object.prototype.hasOwnProperty.call(hint, 'visaSubType'),
    false,
    'null visaSubType omitted',
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(hint, 'category'),
    false,
    'missing category omitted',
  );
}

{
  const app = baseApp();
  app.visaSubType = '  D-type  ';
  app.extras = { category: '  Premium  ' };

  const hint = buildPortalBookingPrefillHint(app, 1);

  assert.equal(hint.visaSubType, 'D-type');
  assert.equal(hint.category, 'Premium');
}

{
  const app = baseApp();
  app.visaSubType = '   ';
  app.extras = { category: '' };

  const hint = buildPortalBookingPrefillHint(app, 1);

  assert.equal(
    Object.prototype.hasOwnProperty.call(hint, 'visaSubType'),
    false,
    'whitespace visaSubType omitted',
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(hint, 'category'),
    false,
    'blank category omitted',
  );
}

console.log('build-portal-booking-prefill-hint.util.spec.ts: ok');
