/// <reference lib="dom" />
/**
 * Ordered Bootstrap consent/attention modal dismissal before form fill
 * (DEC-001–005; REQ-001–007).
 */
import {
  CONSENT_MODAL_ALERT_ONCLICK_SUBSTRING,
  CONSENT_MODAL_ALERT_ROOT_SELECTOR,
  CONSENT_MODAL_ATTENTION_ACCEPT_TEXT,
  CONSENT_MODAL_ATTENTION_TITLE_TEXT,
  CONSENT_MODAL_DP_ONCLICK_SUBSTRING,
  CONSENT_MODAL_DP_ROOT_SELECTOR,
  CONSENT_MODAL_INTER_STEP_DELAY_MS,
  CONSENT_MODAL_POLL_INTERVAL_MS,
  CONSENT_MODAL_SHOWN_SETTLE_MS,
  CONSENT_MODAL_STEP_IDS,
  consentModalPresenceWindowMs,
  consentModalStepBudgetMs,
} from '../constants';
import type {
  ConsentModalStepId,
  ConsentModalStepResult,
  DismissConsentModalsResult,
  PortalPage,
} from '../types';

type ModalActionArg = {
  action: 'inspect' | 'click';
  stepId: ConsentModalStepId;
  alertRoot: string;
  dpRoot: string;
  alertOnclick: string;
  dpOnclick: string;
  attentionTitle: string;
  attentionAccept: string;
};

type ModalActionResult = {
  shown: boolean;
  acceptFound?: boolean;
  acceptReady?: boolean;
  clicked?: boolean;
  error?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildActionArg(
  stepId: ConsentModalStepId,
  action: 'inspect' | 'click',
): ModalActionArg {
  return {
    action,
    stepId,
    alertRoot: CONSENT_MODAL_ALERT_ROOT_SELECTOR,
    dpRoot: CONSENT_MODAL_DP_ROOT_SELECTOR,
    alertOnclick: CONSENT_MODAL_ALERT_ONCLICK_SUBSTRING,
    dpOnclick: CONSENT_MODAL_DP_ONCLICK_SUBSTRING,
    attentionTitle: CONSENT_MODAL_ATTENTION_TITLE_TEXT,
    attentionAccept: CONSENT_MODAL_ATTENTION_ACCEPT_TEXT,
  };
}

/**
 * Single browser evaluate: inspect shown state or accept-only click (DEC-002, DEC-005).
 * Never targets disagree/reject/cancel (CON-006).
 */
function consentModalActionInPage(arg: ModalActionArg): ModalActionResult {
  const isVisible = (el: Element | null): boolean => {
    if (!el) return false;
    const html = el as HTMLElement;
    const style = window.getComputedStyle(html);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (style.opacity === '0') return false;
    return true;
  };

  const isShown = (el: Element | null): boolean => {
    if (!el || !isVisible(el)) return false;
    const html = el as HTMLElement;
    if (html.classList.contains('show')) return true;
    if (html.getAttribute('aria-modal') === 'true') return true;
    // Bootstrap sometimes sets inline display:block before/with .show
    if (html.style.display === 'block') return true;
    return false;
  };

  const findIdRoot = (selector: string): HTMLElement | null =>
    document.querySelector(selector) as HTMLElement | null;

  const findAttentionRoot = (): HTMLElement | null => {
    const modals = Array.from(document.querySelectorAll('.modal'));
    for (const modal of modals) {
      if (!isShown(modal)) continue;
      const content = modal.querySelector('.modal-content');
      if (!content) continue;
      const danger = content.querySelector('span.text-danger');
      const dangerText = (danger?.textContent ?? '').trim();
      if (dangerText === arg.attentionTitle) {
        return modal as HTMLElement;
      }
      const titleText = (
        content.querySelector('.modal-title, h1, h2, h3, h4, h5')
          ?.textContent ?? ''
      )
        .replace(/\s+/g, ' ')
        .trim();
      if (
        titleText === arg.attentionTitle ||
        titleText.startsWith(arg.attentionTitle)
      ) {
        return modal as HTMLElement;
      }
    }
    return null;
  };

  const findRoot = (): HTMLElement | null => {
    if (arg.stepId === 'alertModal') return findIdRoot(arg.alertRoot);
    if (arg.stepId === 'dpModal') return findIdRoot(arg.dpRoot);
    return findAttentionRoot();
  };

  const findAccept = (root: HTMLElement): HTMLElement | null => {
    if (arg.stepId === 'alertModal' || arg.stepId === 'dpModal') {
      const onclickNeedle =
        arg.stepId === 'alertModal' ? arg.alertOnclick : arg.dpOnclick;
      const byOnclick = root.querySelector(
        `button.btn-success[onclick*="${onclickNeedle}"], .btn-success[onclick*="${onclickNeedle}"]`,
      ) as HTMLElement | null;
      if (byOnclick && isVisible(byOnclick)) return byOnclick;
      const fallbacks = Array.from(
        root.querySelectorAll(
          'button.btn-success[data-bs-dismiss="modal"], .btn-success[data-bs-dismiss="modal"]',
        ),
      ) as HTMLElement[];
      return fallbacks.find((el) => isVisible(el)) ?? null;
    }

    const candidates = Array.from(
      root.querySelectorAll(
        'button.btn-success[data-bs-dismiss="modal"], .btn-success[data-bs-dismiss="modal"]',
      ),
    ) as HTMLElement[];
    const acceptNorm = arg.attentionAccept.trim().toLowerCase();
    return (
      candidates.find((el) => {
        if (!isVisible(el)) return false;
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        const lower = text.toLowerCase();
        return lower === acceptNorm || lower.startsWith(acceptNorm);
      }) ?? null
    );
  };

  const root = findRoot();
  const shown = isShown(root);
  if (!shown) {
    return { shown: false, acceptFound: false, acceptReady: false };
  }

  const accept = findAccept(root as HTMLElement);
  const acceptFound = Boolean(accept);
  const acceptReady = Boolean(
    accept && isVisible(accept) && !(accept as HTMLButtonElement).disabled,
  );

  if (arg.action === 'inspect') {
    return { shown: true, acceptFound, acceptReady };
  }

  if (!accept || !acceptReady) {
    return {
      shown: true,
      acceptFound,
      acceptReady: false,
      clicked: false,
      error: `consent modal ${arg.stepId}: shown but accept control not found`,
    };
  }

  try {
    accept.scrollIntoView({ block: 'center', inline: 'nearest' });
    accept.click();
  } catch (err) {
    return {
      shown: true,
      acceptFound: true,
      acceptReady: true,
      clicked: false,
      error: `consent modal ${arg.stepId}: accept click failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  return {
    shown: true,
    acceptFound: true,
    acceptReady: true,
    clicked: true,
  };
}

async function waitForShown(
  page: PortalPage,
  stepId: ConsentModalStepId,
  presenceMs: number,
): Promise<boolean> {
  const arg = buildActionArg(stepId, 'inspect');
  if (presenceMs <= 0) {
    return (await page.evaluate(consentModalActionInPage, arg)).shown;
  }
  const deadline = Date.now() + presenceMs;
  while (Date.now() < deadline) {
    if ((await page.evaluate(consentModalActionInPage, arg)).shown) {
      return true;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(CONSENT_MODAL_POLL_INTERVAL_MS, remaining));
  }
  return (await page.evaluate(consentModalActionInPage, arg)).shown;
}

/**
 * Wait until the accept control is visible/enabled inside an already-shown modal.
 */
async function waitForAcceptReady(
  page: PortalPage,
  stepId: ConsentModalStepId,
  budgetMs: number,
): Promise<ModalActionResult> {
  const arg = buildActionArg(stepId, 'inspect');
  if (budgetMs <= 0) {
    return page.evaluate(consentModalActionInPage, arg);
  }
  const deadline = Date.now() + budgetMs;
  let last = await page.evaluate(consentModalActionInPage, arg);
  while (Date.now() < deadline) {
    if (!last.shown) return last;
    if (last.acceptReady) return last;
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(CONSENT_MODAL_POLL_INTERVAL_MS, remaining));
    last = await page.evaluate(consentModalActionInPage, arg);
  }
  return last;
}

async function waitForHidden(
  page: PortalPage,
  stepId: ConsentModalStepId,
  budgetMs: number,
): Promise<boolean> {
  const arg = buildActionArg(stepId, 'inspect');
  if (budgetMs <= 0) {
    return !(await page.evaluate(consentModalActionInPage, arg)).shown;
  }
  const deadline = Date.now() + budgetMs;
  while (Date.now() < deadline) {
    if (!(await page.evaluate(consentModalActionInPage, arg)).shown) {
      return true;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(CONSENT_MODAL_POLL_INTERVAL_MS, remaining));
  }
  return !(await page.evaluate(consentModalActionInPage, arg)).shown;
}

async function dismissOneStep(
  page: PortalPage,
  stepId: ConsentModalStepId,
  navTimeoutMs: number,
): Promise<ConsentModalStepResult> {
  const stepBudget = consentModalStepBudgetMs(navTimeoutMs);
  const presenceMs = consentModalPresenceWindowMs(stepBudget);
  const stepStarted = Date.now();

  const shown = await waitForShown(page, stepId, presenceMs);
  if (!shown) {
    return { stepId, outcome: 'skipped' };
  }

  const remainingAfterPresence = Math.max(
    0,
    stepBudget - (Date.now() - stepStarted),
  );
  if (remainingAfterPresence <= 0) {
    return {
      stepId,
      outcome: 'failed',
      error: `consent modal ${stepId}: shown but accept timed out (budget exhausted)`,
    };
  }

  await sleep(Math.min(CONSENT_MODAL_SHOWN_SETTLE_MS, remainingAfterPresence));

  const readyBudget = Math.max(0, stepBudget - (Date.now() - stepStarted));
  const ready = await waitForAcceptReady(page, stepId, readyBudget);
  if (!ready.shown) {
    return { stepId, outcome: 'skipped' };
  }
  if (!ready.acceptReady) {
    return {
      stepId,
      outcome: 'failed',
      error:
        ready.error ??
        `consent modal ${stepId}: shown but accept control not found`,
    };
  }

  const clickBudget = Math.max(0, stepBudget - (Date.now() - stepStarted));
  if (clickBudget <= 0) {
    return {
      stepId,
      outcome: 'failed',
      error: `consent modal ${stepId}: shown but accept timed out (budget exhausted)`,
    };
  }

  const clickResult = await page.evaluate(
    consentModalActionInPage,
    buildActionArg(stepId, 'click'),
  );
  if (!clickResult.shown) {
    return { stepId, outcome: 'skipped' };
  }
  if (!clickResult.clicked) {
    return {
      stepId,
      outcome: 'failed',
      error:
        clickResult.error ??
        `consent modal ${stepId}: accept control could not be activated`,
    };
  }

  const hideBudget = Math.max(0, stepBudget - (Date.now() - stepStarted));
  const hidden = await waitForHidden(page, stepId, hideBudget);
  if (!hidden) {
    return {
      stepId,
      outcome: 'failed',
      error: `consent modal ${stepId}: still shown after accept within budget`,
    };
  }

  return { stepId, outcome: 'accepted' };
}

/**
 * Dismiss the three consent/attention modals in fixed order before field fill.
 * Missing/not-shown ⇒ skip; shown but unacceptible ⇒ hard-fail (DEC-003).
 */
export async function dismissConsentModalsInOrder(
  page: PortalPage,
  navTimeoutMs: number,
): Promise<DismissConsentModalsResult> {
  const steps: ConsentModalStepResult[] = [];

  for (let i = 0; i < CONSENT_MODAL_STEP_IDS.length; i += 1) {
    const stepId = CONSENT_MODAL_STEP_IDS[i];
    const result = await dismissOneStep(page, stepId, navTimeoutMs);
    steps.push(result);
    if (result.outcome === 'failed') {
      return {
        ok: false,
        steps,
        error: result.error ?? `consent modal ${stepId}: failed`,
      };
    }

    // Portal opens the next modal after a delay; wait before polling for it.
    const hasNext = i < CONSENT_MODAL_STEP_IDS.length - 1;
    if (hasNext && result.outcome === 'accepted') {
      await sleep(CONSENT_MODAL_INTER_STEP_DELAY_MS);
    }
  }

  return { ok: true, steps };
}
