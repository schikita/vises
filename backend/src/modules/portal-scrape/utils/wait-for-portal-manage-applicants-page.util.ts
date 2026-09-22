import {
  PORTAL_STATUS_PAGE_WAIT_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type CueArg = {
  manageApplicantsHeading: string;
  applicantDetailsHeading: string;
  statusLabelPrefix: string;
};

/**
 * Wait until Manage Applicants list cues are visible
 * (`applicant_details.html` / `ready_book_status.html`).
 */
export const waitForPortalManageApplicantsPage = async (
  page: PortalPage,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const arg: CueArg = {
    manageApplicantsHeading: PORTAL_STATUS_SELECTORS.manageApplicantsHeading,
    applicantDetailsHeading: PORTAL_STATUS_SELECTORS.applicantDetailsHeading,
    statusLabelPrefix: PORTAL_STATUS_SELECTORS.statusLabelPrefix,
  };

  try {
    await page.waitForFunction(
      (a: CueArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const body = collapse(document.body?.textContent ?? '');
        if (body.includes(collapse(a.manageApplicantsHeading))) return true;
        if (body.includes(collapse(a.applicantDetailsHeading))) return true;
        if (body.includes(collapse(a.statusLabelPrefix))) return true;
        return Boolean(
          document.querySelector('div.row.border.p-3.rounded-3.mb-2'),
        );
      },
      arg,
      { timeout: PORTAL_STATUS_PAGE_WAIT_MS },
    );
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: `Manage Applicants page not ready within ${PORTAL_STATUS_PAGE_WAIT_MS}ms`,
    };
  }
};
