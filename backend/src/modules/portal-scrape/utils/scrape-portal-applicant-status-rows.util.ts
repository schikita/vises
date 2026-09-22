import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { PortalPage } from '../types';
import type { PortalApplicantStatusRow } from '../types/portal-status.types';
import { normalizeBlsApplicantPortalStatus } from './normalize-bls-applicant-portal-status.util';

type ScrapeArg = {
  statusLabelPrefix: string;
  editActionTitle: string;
  manageApplicantFn: string;
};

type RawRow = {
  rowIndex: number;
  nameText: string;
  statusRaw: string;
  portalApplicantId: string | null;
  hasEditAction: boolean;
};

/**
 * Scrape Manage Applicants rows (fixtures `applicant_details.html` /
 * `ready_book_status.html`) and normalize status labels.
 */
export const scrapePortalApplicantStatusRows = async (
  page: PortalPage,
): Promise<PortalApplicantStatusRow[]> => {
  const arg: ScrapeArg = {
    statusLabelPrefix: PORTAL_STATUS_SELECTORS.statusLabelPrefix,
    editActionTitle: PORTAL_STATUS_SELECTORS.editActionTitle,
    manageApplicantFn: PORTAL_STATUS_SELECTORS.manageApplicantFn,
  };

  const rawRows = await page.evaluate((a: ScrapeArg): RawRow[] => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim();

    const extractPortalId = (onclick: string | null): string | null => {
      if (!onclick) return null;
      const re = new RegExp(
        `${a.manageApplicantFn}\\(\\s*['"]([^'"]*)['"]`,
        'i',
      );
      const m = onclick.match(re);
      const id = m?.[1]?.trim() ?? '';
      return id.length > 0 ? id : null;
    };

    const rows = Array.from(
      document.querySelectorAll('div.row.border.p-3.rounded-3.mb-2'),
    );
    const out: RawRow[] = [];

    rows.forEach((row, rowIndex) => {
      const text = collapse(row.textContent ?? '');
      let nameText = '';
      const nameCue = row.querySelector(
        'span.d-none.d-sm-inline.d-md-inline.d-lg-none.pr-1',
      );
      if (
        nameCue &&
        collapse(nameCue.textContent ?? '')
          .toLowerCase()
          .startsWith('applicant name')
      ) {
        const parent = nameCue.parentElement;
        nameText = collapse(
          (parent?.textContent ?? '').replace(/Applicant Name:?/i, ''),
        );
      }
      if (!nameText) {
        const nameMatch = text.match(/Applicant Name:\s*(.+?)(?:Relationship:|$)/i);
        nameText = collapse(nameMatch?.[1] ?? '');
      }

      let statusRaw = '';
      const statusSpans = Array.from(
        row.querySelectorAll('span.text-danger, span.text-success, b span'),
      );
      for (const span of statusSpans) {
        const s = collapse(span.textContent ?? '');
        if (s && !s.toLowerCase().startsWith('status')) {
          statusRaw = s;
          break;
        }
      }
      if (!statusRaw) {
        const statusMatch = text.match(/Status:\s*(.+?)(?:Actions:|$)/i);
        statusRaw = collapse(statusMatch?.[1] ?? '');
      }

      const editLink = Array.from(row.querySelectorAll('a')).find((el) => {
        const title = (el.getAttribute('title') ?? '').trim();
        return title === a.editActionTitle;
      });
      const onclick = editLink?.getAttribute('onclick') ?? null;

      out.push({
        rowIndex,
        nameText,
        statusRaw,
        portalApplicantId: extractPortalId(onclick),
        hasEditAction: Boolean(editLink),
      });
    });

    return out;
  }, arg);

  return rawRows.map((row) => ({
    ...row,
    status: normalizeBlsApplicantPortalStatus(row.statusRaw),
  }));
};
