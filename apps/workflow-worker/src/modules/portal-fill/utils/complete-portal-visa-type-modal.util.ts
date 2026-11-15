import { EDIT_MEMBER_VISA_MODAL_FIELD_ID } from '../constants';
import type { PortalPage } from '../types';
import { clickPortalVisaTypeModalProceed } from './click-portal-visa-type-modal-proceed.util';
import { setDropdownField } from './set-dropdown-field.util';
import { waitForPortalOverlaysClear } from './wait-for-portal-overlays-clear.util';
import { waitForPortalVisaTypeModal } from './wait-for-portal-visa-type-modal.util';

/**
 * Wait `#visaTypeModal` → select Location* + Visa Type* via Kendo listbox →
 * Proceed. Returns bound option ids when known (checkpoint-safe).
 */
export const completePortalVisaTypeModal = async (
  page: PortalPage,
  input: { location: string; visaType: string },
): Promise<
  | {
      ok: true;
      locationId?: string;
      visaTypeId?: string;
      notes: string[];
    }
  | { ok: false; error: string; notes: string[] }
> => {
  const notes: string[] = [];
  const location = input.location.trim();
  const visaType = input.visaType.trim();
  if (!location || !visaType) {
    return {
      ok: false,
      error: 'visaTypeModal requires location and visaType from editFill',
      notes,
    };
  }

  const overlays = await waitForPortalOverlaysClear(page);
  if (!overlays.clear) {
    return {
      ok: false,
      error: overlays.reason ?? 'overlays blocking before visaTypeModal',
      notes,
    };
  }

  const modalReady = await waitForPortalVisaTypeModal(page);
  if (!modalReady.ok) {
    return { ok: false, error: modalReady.error, notes };
  }
  notes.push('visaTypeModal visible');

  const locationSet = await setDropdownField(
    page,
    EDIT_MEMBER_VISA_MODAL_FIELD_ID.LocationId,
    location,
  );
  if (!locationSet.ok) {
    return {
      ok: false,
      error: `LocationId select failed: ${locationSet.reason ?? 'unknown'}`,
      notes,
    };
  }
  notes.push(`LocationId set via=${locationSet.via ?? 'dropdown'}`);

  const visaSet = await setDropdownField(
    page,
    EDIT_MEMBER_VISA_MODAL_FIELD_ID.VisaType,
    visaType,
  );
  if (!visaSet.ok) {
    return {
      ok: false,
      error: `VisaType select failed: ${visaSet.reason ?? 'unknown'}`,
      notes,
    };
  }
  notes.push(`VisaType set via=${visaSet.via ?? 'dropdown'}`);

  const proceedOverlays = await waitForPortalOverlaysClear(page);
  if (!proceedOverlays.clear) {
    return {
      ok: false,
      error: proceedOverlays.reason ?? 'overlays blocking before Proceed',
      notes,
    };
  }

  const proceeded = await clickPortalVisaTypeModalProceed(page);
  if (!proceeded.ok) {
    return { ok: false, error: proceeded.error, notes };
  }
  notes.push(`Proceed clicked via=${proceeded.via}`);

  const locationId = locationSet.value?.trim();
  const visaTypeId = visaSet.value?.trim();

  return {
    ok: true,
    ...(locationId ? { locationId } : {}),
    ...(visaTypeId ? { visaTypeId } : {}),
    notes,
  };
};
