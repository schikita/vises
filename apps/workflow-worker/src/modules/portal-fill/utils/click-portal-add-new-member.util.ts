import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type ClickArg = {
  addNewMemberText: string;
  manageApplicantFn: string;
};

/**
 * Click Add New Member (`ManageApplicant('')`) on Manage Applicants.
 * Call only when OQ-005 gate + Phase B allow the click.
 */
export const clickPortalAddNewMember = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    addNewMemberText: PORTAL_STATUS_SELECTORS.addNewMemberText,
    manageApplicantFn: PORTAL_STATUS_SELECTORS.manageApplicantFn,
  };

  try {
    await page.waitForFunction(
      (a: ClickArg) => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.some((el) => {
          const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
          if (!text.includes(a.addNewMemberText)) {
            return false;
          }
          const onclick = el.getAttribute('onclick') ?? '';
          const single = `${a.manageApplicantFn}('')`;
          const double = `${a.manageApplicantFn}("")`;
          return onclick.includes(single) || onclick.includes(double);
        });
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Add New Member control not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ClickArg) => {
    const link = Array.from(document.querySelectorAll('a')).find((el) => {
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!text.includes(a.addNewMemberText)) {
        return false;
      }
      const onclick = el.getAttribute('onclick') ?? '';
      const single = `${a.manageApplicantFn}('')`;
      const double = `${a.manageApplicantFn}("")`;
      return onclick.includes(single) || onclick.includes(double);
    }) as HTMLAnchorElement | undefined;
    if (!link) {
      return { ok: false as const, via: 'link-missing' };
    }
    link.click();
    return { ok: true as const, via: a.addNewMemberText };
  }, arg);

  if (!clicked.ok) {
    return {
      ok: false,
      error: `Add New Member click failed (${clicked.via})`,
    };
  }
  return { ok: true, via: clicked.via };
};
