import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { PortalDomContext } from '../types/portal-dom-context.types';

type ReadyArg = {
  editFormId: string;
  editFormActionSubstring: string;
  firstNameName: string;
};

/**
 * True when `#myForm` ManageApplicant + `#FirstName` are present in context
 * (typically `iframe.k-content-frame`).
 */
export const isPortalEditMemberFormReadyInContext = async (
  context: PortalDomContext,
): Promise<boolean> => {
  const arg: ReadyArg = {
    editFormId: PORTAL_STATUS_SELECTORS.editFormId,
    editFormActionSubstring: PORTAL_STATUS_SELECTORS.editFormActionSubstring,
    firstNameName: PORTAL_STATUS_SELECTORS.firstNameName,
  };

  return context.evaluate((a: ReadyArg) => {
    const formById = document.getElementById(a.editFormId);
    if (formById) {
      const action = formById.getAttribute('action') ?? '';
      if (action.includes(a.editFormActionSubstring)) {
        return Boolean(
          formById.querySelector(
            `#${CSS.escape(a.firstNameName)}, input[name="${a.firstNameName}"]`,
          ),
        );
      }
    }
    const forms = Array.from(document.querySelectorAll('form'));
    return forms.some((f) => {
      const action = f.getAttribute('action') ?? '';
      if (!action.includes(a.editFormActionSubstring)) return false;
      return Boolean(
        f.querySelector(
          `#${CSS.escape(a.firstNameName)}, input[name="${a.firstNameName}"]`,
        ),
      );
    });
  }, arg);
};
