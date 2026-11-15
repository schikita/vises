import {
  PORTAL_APPLICANT_STATUS_LABELS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';
import type { PortalApplicantStatusRow } from '../types/portal-status.types';
import { normalizeBlsApplicantPortalStatus } from './normalize-bls-applicant-portal-status.util';

type ScrapeArg = {
  statusLabelPrefix: string;
  editActionTitle: string;
  manageApplicantFn: string;
  readyLabel: string;
  formFillingLabel: string;
  readyCssClass: string;
  formFillingCssClass: string;
};

type RawRow = {
  rowIndex: number;
  nameText: string;
  statusRaw: string;
  portalApplicantId: string | null;
  hasEditAction: boolean;
};

/**
 * Scrape Manage Applicants rows and normalize status labels (OQ-006).
 * Prefer exact portal label text; CSS class (`text-success` / `text-danger`)
 * is a secondary cue only when label text is empty.
 */
export const scrapePortalApplicantStatusRows = async (
  page: PortalPage,
): Promise<PortalApplicantStatusRow[]> => {
  const arg: ScrapeArg = {
    statusLabelPrefix: PORTAL_STATUS_SELECTORS.statusLabelPrefix,
    editActionTitle: PORTAL_STATUS_SELECTORS.editActionTitle,
    manageApplicantFn: PORTAL_STATUS_SELECTORS.manageApplicantFn,
    readyLabel: PORTAL_APPLICANT_STATUS_LABELS.READY_TO_BOOK,
    formFillingLabel: PORTAL_APPLICANT_STATUS_LABELS.FORM_FILLING_IN_PROGRESS,
    readyCssClass: PORTAL_STATUS_SELECTORS.readyStatusCssClass,
    formFillingCssClass: PORTAL_STATUS_SELECTORS.formFillingStatusCssClass,
  };

  const rawRows = await page.evaluate((a: ScrapeArg): RawRow[] => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim();
    const collapseLower = (text: string): string =>
      collapse(text).toLowerCase();

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

    const pickExactLabel = (candidates: string[]): string => {
      const readyExact = collapseLower(a.readyLabel);
      const formExact = collapseLower(a.formFillingLabel);
      for (const candidate of candidates) {
        const c = collapseLower(candidate);
        if (c === readyExact || c === formExact) {
          return collapse(candidate);
        }
      }
      for (const candidate of candidates) {
        const c = collapseLower(candidate);
        if (c.includes(readyExact) || c.includes(formExact)) {
          return collapse(candidate);
        }
      }
      return '';
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
        const nameMatch = text.match(
          /Applicant Name:\s*(.+?)(?:Relationship:|$)/i,
        );
        nameText = collapse(nameMatch?.[1] ?? '');
      }

      const labelCandidates: string[] = [];
      const statusSpans = Array.from(
        row.querySelectorAll(
          `span.${a.formFillingCssClass}, span.${a.readyCssClass}, b span, span`,
        ),
      );
      for (const span of statusSpans) {
        const s = collapse(span.textContent ?? '');
        if (!s || s.toLowerCase().startsWith('status')) {
          continue;
        }
        labelCandidates.push(s);
      }

      let statusRaw = pickExactLabel(labelCandidates);

      // Secondary: CSS class only when no label text matched (OQ-006).
      if (!statusRaw) {
        const readyByClass = row.querySelector(`span.${a.readyCssClass}`);
        const formByClass = row.querySelector(
          `span.${a.formFillingCssClass}`,
        );
        if (readyByClass) {
          const t = collapse(readyByClass.textContent ?? '');
          if (t && !t.toLowerCase().startsWith('status')) {
            statusRaw = t;
          }
        } else if (formByClass) {
          const t = collapse(formByClass.textContent ?? '');
          if (t && !t.toLowerCase().startsWith('status')) {
            statusRaw = t;
          }
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
