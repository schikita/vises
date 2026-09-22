import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type FillArg = {
  editFormId: string;
  editFormActionSubstring: string;
  firstNameName: string;
  lastNameName: string;
  surNameName: string;
  placeOfBirthName: string;
  passportNoName: string;
  firstName?: string;
  lastName?: string;
  placeOfBirth?: string;
  passportNumber?: string;
};

/**
 * Fill empty simple text fields on the edit form from CRM applicant values
 * (`edit_app.html`). Does not touch Kendo dropdowns.
 */
export const fillPortalApplicantEditForm = async (
  page: PortalPage,
  fill: {
    firstName?: string;
    lastName?: string;
    placeOfBirth?: string;
    passportNumber?: string;
  },
): Promise<{ ok: true; filled: string[] } | { ok: false; reason: string }> => {
  const arg: FillArg = {
    editFormId: PORTAL_STATUS_SELECTORS.editFormId,
    editFormActionSubstring: PORTAL_STATUS_SELECTORS.editFormActionSubstring,
    firstNameName: PORTAL_STATUS_SELECTORS.firstNameName,
    lastNameName: PORTAL_STATUS_SELECTORS.lastNameName,
    surNameName: PORTAL_STATUS_SELECTORS.surNameName,
    placeOfBirthName: PORTAL_STATUS_SELECTORS.placeOfBirthName,
    passportNoName: PORTAL_STATUS_SELECTORS.passportNoName,
    firstName: fill.firstName?.trim() || undefined,
    lastName: fill.lastName?.trim() || undefined,
    placeOfBirth: fill.placeOfBirth?.trim() || undefined,
    passportNumber: fill.passportNumber?.trim() || undefined,
  };

  const result = await page.evaluate((a: FillArg) => {
    const form =
      (document.getElementById(a.editFormId) as HTMLFormElement | null) ??
      (Array.from(document.querySelectorAll('form')).find((f) =>
        (f.getAttribute('action') ?? '').includes(a.editFormActionSubstring),
      ) as HTMLFormElement | undefined);
    if (!form) {
      return { ok: false as const, reason: 'edit-form-missing' };
    }

    const filled: string[] = [];
    const setIfEmpty = (
      name: string,
      value: string | undefined,
      label: string,
    ): void => {
      if (!value) return;
      const input = form.querySelector(
        `input[name="${name}"]`,
      ) as HTMLInputElement | null;
      if (!input) return;
      if ((input.value ?? '').trim().length > 0) return;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      filled.push(label);
    };

    setIfEmpty(a.firstNameName, a.firstName, a.firstNameName);
    setIfEmpty(a.lastNameName, a.lastName, a.lastNameName);
    setIfEmpty(a.surNameName, a.lastName, a.surNameName);
    setIfEmpty(a.placeOfBirthName, a.placeOfBirth, a.placeOfBirthName);
    setIfEmpty(a.passportNoName, a.passportNumber, a.passportNoName);

    return { ok: true as const, filled };
  }, arg);

  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }
  return { ok: true, filled: result.filled };
};
