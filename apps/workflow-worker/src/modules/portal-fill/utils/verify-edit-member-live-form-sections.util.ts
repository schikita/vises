import { EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID } from '../constants';
import type { PortalWidgetSurface } from '../types';
import { resolvePortalFieldSelector } from './resolve-portal-field-selector.util';

/**
 * Probe live iframe for Schengen happy-path anchors before assuming field ids
 * (OQ-003 / nationalVisaVerifyFirst).
 */
export const verifyEditMemberLiveFormSections = async (
  surface: PortalWidgetSurface,
): Promise<{ ok: true } | { ok: false; reason: string; missingIds: string[] }> => {
  const probeIds = [
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.FirstName,
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.PassportNo,
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.PurposeOfJourneyId,
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.PreviousFingerPrintStatus,
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.BlsInvitingAuthority,
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.CostCoveredById,
  ];

  const selectors = probeIds.map((id) => ({
    id,
    selector: resolvePortalFieldSelector(id),
  }));

  const missingIds = await surface.evaluate(
    (
      probes: Array<{ id: string; selector: string }>,
    ): string[] => {
      const missing: string[] = [];
      for (const probe of probes) {
        if (probe.id === 'PreviousFingerPrintStatus' || probe.id === 'BlsInvitingAuthority') {
          const radios = document.querySelectorAll(
            `input[type="radio"][name="${probe.id}"]`,
          );
          if (radios.length === 0) {
            missing.push(probe.id);
          }
          continue;
        }
        if (!document.querySelector(probe.selector)) {
          missing.push(probe.id);
        }
      }
      return missing;
    },
    selectors,
  );

  if (missingIds.length > 0) {
    return {
      ok: false,
      reason: `nationalVisaVerifyFirst: live form missing Schengen anchors (${missingIds.join(',')}) — refuse Schengen id assumptions`,
      missingIds,
    };
  }
  return { ok: true };
};
