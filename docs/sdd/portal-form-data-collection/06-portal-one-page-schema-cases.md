# Portal one-page schema cases (PF-TASK-004)

Normative Zod: `apps/web/src/features/application-form/constants/portal-one-page-form.schema.ts`  
Completeness key mirror: `…/constants/bls-applicant-completeness.constants.ts` (cites API SoT).

## Cases

| Case | Expected |
|------|----------|
| Inviting = company (`0`) | Auth block (`inviting_*`) **and** contact block (`invitingContact*`) required |
| Inviting = hotel (`1`) | Auth block required; contact block **not** required |
| Inviting = person (`2`) | Contact block required; auth block **not** required |
| Inviting unset / empty | Fail on `blsInvitingAuthority`; no invented company default; branch fields not validated until selected |
| Inactive minor (`isMinor` false/empty) | Parent fields **not** required |
| Active minor | `minorParentSurname/FirstName/LastName/Nationality/Address` required |
| Fingerprint status empty | Allowed (no invented status); date **not** required |
| Fingerprint status = `0` | `previousFingerPrintDate` required |
| Fingerprint status = `1` or `2` | Date **not** required |
| Travel / Intended Arrival | Both UI fields present; kept synchronized to one `travelDate` store via `syncIntendedArrivalWithTravelDate`; refine rejects divergent values |
| Other residence / prior visa inactive | Dependent dates **not** required |
| Entry permit / EU family | Optional (site has no required `*`); empty OK — do not invent |

## Option lists (AC-13)

English worker-mappable label strings only — no GUID tables: purposes, entries, occupations, cost covered by, means of support, inviting labels, fingerprint labels, EU family relationships, passport types (existing).
