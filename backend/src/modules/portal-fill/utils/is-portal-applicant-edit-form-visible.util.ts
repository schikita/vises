import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type VisibleArg = {
  editFormId: string;
  editFormActionSubstring: string;
  firstNameName: string;
};

/**
 * True when the Edit Member / ManageApplicant form is visible
 * (`edit_app.html` cues).
 */
export const isPortalApplicantEditFormVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: VisibleArg = {
    editFormId: PORTAL_STATUS_SELECTORS.editFormId,
    editFormActionSubstring: PORTAL_STATUS_SELECTORS.editFormActionSubstring,
    firstNameName: PORTAL_STATUS_SELECTORS.firstNameName,
  };

  return page.evaluate((a: VisibleArg) => {
    const byId = document.getElementById(a.editFormId);
    if (byId) {
      const action = byId.getAttribute('action') ?? '';
      if (action.includes(a.editFormActionSubstring)) {
        return Boolean(
          byId.querySelector(`input[name="${a.firstNameName}"]`),
        );
      }
    }
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.some((f) => {
      const action = f.getAttribute('action') ?? '';
      if (!action.includes(a.editFormActionSubstring)) return false;
      return Boolean(f.querySelector(`input[name="${a.firstNameName}"]`));
    });
  }, arg);
};
