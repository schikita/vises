import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { IsPortalApplicantEditValidationSummaryClearResult } from '../types/is-portal-applicant-edit-validation-summary-clear.types';
import type { PortalDomContext } from '../types/portal-dom-context.types';

type ProbeArg = {
  selector: string;
};

/**
 * True when Edit Member validation summary is absent, hidden, or empty
 * (REQ-013 pre-submit gate).
 */
export const isPortalApplicantEditValidationSummaryClear = async (
  context: PortalDomContext,
): Promise<IsPortalApplicantEditValidationSummaryClearResult> => {
  const arg: ProbeArg = {
    selector: PORTAL_STATUS_SELECTORS.editValidationSummarySelector,
  };

  const probe = await context.evaluate((a: ProbeArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim();
    const nodes = Array.from(document.querySelectorAll(a.selector));
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') {
        continue;
      }
      if (node.classList.contains('validation-summary-valid')) {
        const visibleItems = Array.from(node.querySelectorAll('li')).filter(
          (li) => {
            if (!(li instanceof HTMLElement)) {
              return false;
            }
            const liStyle = window.getComputedStyle(li);
            if (liStyle.display === 'none') {
              return false;
            }
            return collapse(li.textContent ?? '').length > 0;
          },
        );
        if (visibleItems.length === 0) {
          continue;
        }
      }
      const text = collapse(node.textContent ?? '');
      if (text.length === 0) {
        continue;
      }
      return { summaryVisible: true as const, summaryText: text.slice(0, 240) };
    }
    return { summaryVisible: false as const };
  }, arg);

  if (probe.summaryVisible) {
    return {
      clear: false,
      summaryVisible: true,
      ...(probe.summaryText ? { summaryText: probe.summaryText } : {}),
    };
  }
  return { clear: true, summaryVisible: false };
};
