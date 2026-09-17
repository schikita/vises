/// <reference lib="dom" />
import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

/**
 * Fail fast unless `#myForm` is present (stable RegisterUser root).
 */
export const assertMyForm = async (page: PortalPage): Promise<void> => {
  const formRoot = PORTAL_REGISTER_USER_SELECTORS.formRoot;
  const verifyControl = PORTAL_REGISTER_USER_SELECTORS.verifyControl;

  const diagnostics = await page.evaluate(
    ({
      formRootSel,
      verifyControlSel,
    }: {
      formRootSel: string;
      verifyControlSel: string;
    }) => ({
      hasForm: Boolean(document.querySelector(formRootSel)),
      hasBtnVerify: Boolean(document.querySelector(verifyControlSel)),
      title: document.title,
      url: location.href,
    }),
    { formRootSel: formRoot, verifyControlSel: verifyControl },
  );

  if (!diagnostics.hasForm) {
    throw new Error(
      `${formRoot} not found — fail fast. diagnostics=${JSON.stringify(diagnostics)}`,
    );
  }
};
