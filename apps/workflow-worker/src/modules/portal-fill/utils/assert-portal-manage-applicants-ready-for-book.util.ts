import { BLS_APPLICANT_PORTAL_STATUS } from '../constants';
import type { AssertPortalManageApplicantsReadyForBookResult } from '../types/assert-portal-manage-applicants-ready-for-book.types';
import type { PortalPage } from '../types';
import { areRequiredApplicantsReadyToBook } from './are-required-applicants-ready-to-book.util';
import { scrapePortalApplicantStatusRows } from './scrape-portal-applicant-status-rows.util';

/**
 * BOOK Ready gate (this-spec CON-006): scrape Manage Applicants and require
 * every scraped applicant row to be READY_TO_BOOK before Book New Appointment.
 * Label-first recognition via scrape/normalize (OQ-006).
 */
export const assertPortalManageApplicantsReadyForBook = async (
  page: PortalPage,
): Promise<AssertPortalManageApplicantsReadyForBookResult> => {
  const notes: string[] = [];
  const rows = await scrapePortalApplicantStatusRows(page);
  notes.push(`book_gate_scraped_rows=${rows.length}`);

  if (rows.length === 0) {
    return {
      ok: false,
      error: 'Manage Applicants empty — cannot verify READY_TO_BOOK before Book',
      notes,
    };
  }

  const statuses = rows.map((row) => row.status);
  const readyCount = statuses.filter(
    (status) => status === BLS_APPLICANT_PORTAL_STATUS.READY_TO_BOOK,
  ).length;
  notes.push(`book_gate_ready_count=${readyCount}/${rows.length}`);

  if (!areRequiredApplicantsReadyToBook({ statuses })) {
    const sample = rows
      .map((row) => `${row.status}:${row.statusRaw.slice(0, 40)}`)
      .join('|')
      .slice(0, 200);
    return {
      ok: false,
      error: `Book New Appointment blocked — applicants not READY_TO_BOOK (${sample})`,
      notes,
    };
  }

  return { ok: true, readyCount, notes };
};
