import { ALL_APP_STATUSES } from '../../apps/constants';
import { iso } from '../../../shared/utils';
import {
  SEED_APP_COMMENTS,
  SEED_CITIES,
  SEED_DEFAULT_PRICE,
  SEED_DESTINATIONS,
  SEED_DOC_TYPES,
  SEED_EXTRA_APP_COUNT,
  SEED_EXTRA_PORTAL_FORM_EMAIL_DOMAIN,
  SEED_EXTRA_PORTAL_FORM_EMAIL_LOCAL_PREFIX,
  SEED_PAYMENT_NOTES,
  SEED_RNG_SEED,
  SEED_VISA_TYPES,
  SEED_VISIT_PLACES,
} from '../constants';
import type { AppFactory, SeedClientProfile } from '../types';
import { buildSeedApplicant } from './build-seed-applicant.util';
import { createSeedRng } from './create-seed-rng.util';
import { pickSeedDateString } from './pick-seed-date-string.util';
import { pickSeedInt } from './pick-seed-int.util';
import { pickSeedItem } from './pick-seed-item.util';
import type { Application } from '../../database/entities/application.entity';

/** Extra applications spanning all CRM statuses, linked to seed clients. */
export const buildExtraSeedApps = (
  applications: AppFactory,
  clients: readonly SeedClientProfile[],
  managerNames: readonly string[],
): Application[] => {
  const rng = createSeedRng(SEED_RNG_SEED + 17);
  const apps: Application[] = [];

  for (let i = 0; i < SEED_EXTRA_APP_COUNT; i += 1) {
    const status = ALL_APP_STATUSES[i % ALL_APP_STATUSES.length]!;
    const client = pickSeedItem(clients, rng);
    const manager = pickSeedItem(managerNames, rng);
    const applicantCount = rng() < 0.7 ? 1 : 2;
    const applicants = Array.from({ length: applicantCount }, (_, idx) =>
      buildSeedApplicant(`p-seed-${i + 1}-${idx + 1}`, rng),
    );
    const primary = applicants[0]!;
    const travelDate = pickSeedDateString(2026, 2027, rng);
    const travelMonth = Number(travelDate.slice(5, 7));
    const travelDay = Number(travelDate.slice(8, 10));
    const returnDay = Math.min(28, travelDay + pickSeedInt(5, 14, rng));
    const returnDate = `${travelDate.slice(0, 5)}${String(travelMonth).padStart(2, '0')}-${String(returnDay).padStart(2, '0')}`;
    const hasVisit = status === 'booked' || status === 'done' || status === 'ready';
    const paymentPaid =
      status === 'booked' ||
      status === 'done' ||
      status === 'autofill_ok' ||
      rng() < 0.35;
    const docsCount =
      status === 'new'
        ? 0
        : status === 'docs'
          ? pickSeedInt(0, 2, rng)
          : pickSeedInt(1, 4, rng);

    // Post-autofill-like statuses get a distinct portal-form email; others stay null (DEC-005).
    const portalFormEmail =
      status === 'autofill_ok' || status === 'booked' || status === 'done'
        ? `${SEED_EXTRA_PORTAL_FORM_EMAIL_LOCAL_PREFIX}${i + 1}@${SEED_EXTRA_PORTAL_FORM_EMAIL_DOMAIN}`
        : null;

    apps.push(
      applications.create({
        id: `a-seed-${i + 1}`,
        code: `VS-${2500 + i}`,
        clientEmail: client.email,
        portalFormEmail,
        status,
        destination: pickSeedItem(SEED_DESTINATIONS, rng),
        visaType: pickSeedItem(SEED_VISA_TYPES, rng),
        submitCountry: 'Belarus',
        submitCity: pickSeedItem(SEED_CITIES, rng),
        travelDate,
        returnDate,
        comment: pickSeedItem(SEED_APP_COMMENTS, rng),
        applicants,
        documents: Array.from({ length: docsCount }, (_, docIdx) => {
          const type = pickSeedItem(SEED_DOC_TYPES, rng);
          return {
            id: `d-seed-${i + 1}-${docIdx + 1}`,
            type,
            name: `${type}-${docIdx + 1}.${type === 'passport' || type === 'insurance' ? 'pdf' : 'jpg'}`,
            uploadedAt: iso(pickSeedInt(0, 10, rng)),
          };
        }),
        paymentAmount: SEED_DEFAULT_PRICE * applicantCount,
        paymentPaid,
        paymentNote: paymentPaid
          ? pickSeedItem(
              SEED_PAYMENT_NOTES.filter((note) => note.length > 0),
              rng,
            )
          : '',
        visitDate: hasVisit ? pickSeedDateString(2026, 2026, rng) : '',
        visitTime: hasVisit
          ? `${String(pickSeedInt(9, 16, rng)).padStart(2, '0')}:${pickSeedItem(['00', '20', '40'] as const, rng)}`
          : '',
        visitPlace: hasVisit ? pickSeedItem(SEED_VISIT_PLACES, rng) : '',
        manager,
        extras: {},
        timeline: [
          {
            at: iso(pickSeedInt(2, 14, rng), pickSeedInt(9, 17, rng)),
            text:
              applicantCount > 1
                ? `Заявка создана, ${applicantCount} заявителя`
                : 'Заявка создана',
            actor: client.name,
          },
          ...(status !== 'new'
            ? [
                {
                  at: iso(pickSeedInt(0, 5, rng), pickSeedInt(9, 17, rng)),
                  text: `Статус изменён на ${status}`,
                  actor: manager,
                },
              ]
            : []),
          ...(hasVisit
            ? [
                {
                  at: iso(pickSeedInt(0, 3, rng), pickSeedInt(9, 17, rng)),
                  text: `Визит назначен для заявителя ${primary.firstName}`,
                  actor: manager,
                },
              ]
            : []),
        ],
      }),
    );
  }

  return apps;
};
