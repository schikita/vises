import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import type { Application } from '../../database/entities/application.entity';
import type { Client } from '../../database/entities/client.entity';
import {
  SEED_APP_COMMENTS,
  SEED_CITIES,
  SEED_DEFAULT_PRICE,
  SEED_DESTINATIONS,
  SEED_DOC_TYPES,
  SEED_PAYMENT_NOTES,
  SEED_PORTAL_FORM_EMAIL_DOMAIN,
  SEED_PORTAL_FORM_EMAIL_LOCAL_PREFIX,
  SEED_RNG_SEED,
  SEED_TIMELINE_ACTOR,
  SEED_VISA_TYPES,
  SEED_VISIT_PLACES,
} from '../constants';
import type {
  BuildFr11AgentAppsInput,
  BuildFr11AgentAppsResult,
  SeedRng,
} from '../types';
import { addSeedUtcDays } from './add-seed-utc-days.util';
import { buildSeedApplicant } from './build-seed-applicant.util';
import { buildStatusHistoryChain } from './build-status-history-chain.util';
import { createSeedRng } from './create-seed-rng.util';
import { mapSeedApplicantToPassportFields } from './map-seed-applicant-to-passport-fields.util';
import { pickSeedDateString } from './pick-seed-date-string.util';
import { pickSeedInt } from './pick-seed-int.util';
import { pickSeedItem } from './pick-seed-item.util';

/** Build client↔application rows + status history for one FR-11 agent (seed stays 1 app per client). */
export const buildFr11AgentApps = (
  input: BuildFr11AgentAppsInput,
): BuildFr11AgentAppsResult => {
  const rng: SeedRng = createSeedRng(SEED_RNG_SEED + input.rngSeedOffset);
  const outClients: Client[] = [];
  const outApps: Application[] = [];
  const outHistory: ApplicationStatusHistory[] = [];
  const clientIds: string[] = [];

  input.statuses.forEach((status, index) => {
    const n = index + 1;
    const clientId = `c-${input.agentKey}-${n}`;
    const applicationId = `a-${input.agentKey}-${n}`;
    const email = `client.${input.agentKey}.${n}@example.com`;
    const applicant = buildSeedApplicant(`apl-${input.agentKey}-${n}`, email, rng);
    const encrypted = input.encryptFields(
      mapSeedApplicantToPassportFields(applicant),
    );
    const createdAt = addSeedUtcDays(input.now, -(input.statuses.length - index));
    const hasVisit = status === 'booked' || status === 'issued';
    const paymentPaid = status === 'booked' || status === 'issued';
    const travelDate = pickSeedDateString(2026, 2027, rng);
    const travelDay = Number(travelDate.slice(8, 10));
    const returnDay = Math.min(28, travelDay + pickSeedInt(5, 14, rng));
    const returnDate = `${travelDate.slice(0, 8)}${String(returnDay).padStart(2, '0')}`;
    const docsCount = status === 'drafting' ? 0 : pickSeedInt(1, 3, rng);

    clientIds.push(clientId);
    outClients.push(
      input.clients.create({
        id: clientId,
        agentId: input.agentId,
        email: applicant.email,
        phone: applicant.phone,
        address: null,
        purpose: null,
        firstEntry: null,
        entries: null,
        durationDays: null,
        relationship: null,
        passportNumber: encrypted.passportNumber ?? null,
        passportIssued: encrypted.passportIssued ?? null,
        passportExpires: encrypted.passportExpires ?? null,
        passportType: encrypted.passportType ?? null,
        passportIssueCountry: encrypted.passportIssueCountry ?? null,
        passportIssuedBy: encrypted.passportIssuedBy ?? null,
        firstName: encrypted.firstName ?? null,
        lastName: encrypted.lastName ?? null,
        lastNameAtBirth: encrypted.lastNameAtBirth ?? null,
        dob: encrypted.dob ?? null,
        placeOfBirth: encrypted.placeOfBirth ?? null,
        countryOfBirth: encrypted.countryOfBirth ?? null,
        nationality: encrypted.nationality ?? null,
        nationalityAtBirth: encrypted.nationalityAtBirth ?? null,
        nationalId: encrypted.nationalId ?? null,
        otherNames: encrypted.otherNames ?? null,
        gender: encrypted.gender ?? null,
        maritalStatus: encrypted.maritalStatus ?? null,
        createdAt,
        updatedAt: createdAt,
      }),
    );

    outApps.push(
      input.applications.create({
        id: applicationId,
        clientId,
        code: `VS-${input.agentKey}${String(n).padStart(3, '0')}`,
        clientEmail: applicant.email,
        portalFormEmail: hasVisit
          ? `${SEED_PORTAL_FORM_EMAIL_LOCAL_PREFIX}${input.agentKey}-${n}@${SEED_PORTAL_FORM_EMAIL_DOMAIN}`
          : null,
        status,
        destination: pickSeedItem(SEED_DESTINATIONS, rng),
        visaType: pickSeedItem(SEED_VISA_TYPES, rng),
        submitCountry: 'Беларусь',
        submitCity: pickSeedItem(SEED_CITIES, rng),
        travelDate,
        returnDate,
        comment: pickSeedItem(SEED_APP_COMMENTS, rng),
        documents: Array.from({ length: docsCount }, (_, docIdx) => {
          const type = pickSeedItem(SEED_DOC_TYPES, rng);
          return {
            id: `d-${input.agentKey}-${n}-${docIdx + 1}`,
            type,
            name: `${type}-${docIdx + 1}.${type === 'passport' || type === 'insurance' ? 'pdf' : 'jpg'}`,
            uploadedAt: createdAt.toISOString(),
          };
        }),
        paymentAmount: SEED_DEFAULT_PRICE,
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
        manager: input.agentName,
        extras: {},
        timeline: [
          {
            at: createdAt.toISOString(),
            text: 'Заявка создана',
            actor: SEED_TIMELINE_ACTOR,
          },
        ],
        createdAt,
        updatedAt: createdAt,
      }),
    );

    const transitions = buildStatusHistoryChain(status, input.agentId);
    transitions.forEach((step, stepIndex) => {
      outHistory.push(
        input.history.create({
          id: `ash-${input.agentKey}-${n}-${stepIndex + 1}`,
          applicationId,
          fromStatus: step.fromStatus,
          toStatus: step.toStatus,
          actorId: step.actorId,
          actorRole: step.actorRole,
          trigger: step.trigger,
          createdAt: addSeedUtcDays(createdAt, step.dayOffset),
        }),
      );
    });
  });

  return {
    clients: outClients,
    applications: outApps,
    history: outHistory,
    clientIds,
  };
};
