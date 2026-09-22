import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type ClickArg = {
  editActionTitle: string;
  manageApplicantFn: string;
  portalApplicantId: string | null;
  rowIndex: number;
};

/**
 * Click Edit/Complete Applicant Details for a scraped Manage Applicants row.
 */
export const clickPortalApplicantEdit = async (
  page: PortalPage,
  input: {
    portalApplicantId: string | null;
    rowIndex: number;
  },
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    editActionTitle: PORTAL_STATUS_SELECTORS.editActionTitle,
    manageApplicantFn: PORTAL_STATUS_SELECTORS.manageApplicantFn,
    portalApplicantId: input.portalApplicantId,
    rowIndex: input.rowIndex,
  };

  try {
    await page.waitForFunction(
      (a: ClickArg) => {
        const rows = Array.from(
          document.querySelectorAll('div.row.border.p-3.rounded-3.mb-2'),
        );
        const row = rows[a.rowIndex];
        if (!row) return false;
        const links = Array.from(row.querySelectorAll('a'));
        return links.some((el) => {
          const title = (el.getAttribute('title') ?? '').trim();
          if (title !== a.editActionTitle) return false;
          if (!a.portalApplicantId) return true;
          const onclick = el.getAttribute('onclick') ?? '';
          return onclick.includes(a.portalApplicantId);
        });
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Edit/Complete control not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ClickArg) => {
    const rows = Array.from(
      document.querySelectorAll('div.row.border.p-3.rounded-3.mb-2'),
    );
    const row = rows[a.rowIndex];
    if (!row) {
      return { ok: false as const, via: 'row-missing' };
    }
    const link = Array.from(row.querySelectorAll('a')).find((el) => {
      const title = (el.getAttribute('title') ?? '').trim();
      if (title !== a.editActionTitle) return false;
      if (!a.portalApplicantId) return true;
      const onclick = el.getAttribute('onclick') ?? '';
      return onclick.includes(a.portalApplicantId);
    }) as HTMLAnchorElement | undefined;
    if (!link) {
      return { ok: false as const, via: 'link-missing' };
    }
    link.click();
    return { ok: true as const, via: a.editActionTitle };
  }, arg);

  if (!clicked.ok) {
    return {
      ok: false,
      error: `Edit/Complete click failed (${clicked.via})`,
    };
  }
  return { ok: true, via: clicked.via };
};
