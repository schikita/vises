import { PORTAL_LOGIN_SELECTORS } from '../constants';
import type {
  DiscoverLoginEmailControlResult,
  PortalPage,
} from '../types';

type DiscoverArg = {
  formActionSubstring: string;
  verifyControl: string;
  emailLabelText: string;
  entryDisabledClass: string;
};

/**
 * Discover the real Email input among decoys on the portal login form (DEC-010).
 * Uses visibility / interactability heuristics — never hardcodes sample ids.
 */
export const discoverLoginEmailControl = async (
  page: PortalPage,
): Promise<DiscoverLoginEmailControlResult> => {
  const arg: DiscoverArg = {
    formActionSubstring: PORTAL_LOGIN_SELECTORS.formActionSubstring,
    verifyControl: PORTAL_LOGIN_SELECTORS.verifyControl,
    emailLabelText: PORTAL_LOGIN_SELECTORS.emailLabelText,
    entryDisabledClass: PORTAL_LOGIN_SELECTORS.entryDisabledClass,
  };

  const result = await page.evaluate((a: DiscoverArg) => {
    const normalizeLabel = (text: string): string =>
      text.replace(/\s+/g, ' ').replace(/\*/g, '').trim().toLowerCase();

    const labelNeedle = normalizeLabel(a.emailLabelText);

    const resolveForm = (): HTMLFormElement | null => {
      const forms = Array.from(document.querySelectorAll('form'));
      const byAction = forms.find((f) =>
        (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
      );
      if (byAction) {
        return byAction;
      }
      const verify = document.querySelector(a.verifyControl);
      if (verify) {
        const closest = verify.closest('form');
        if (closest instanceof HTMLFormElement) {
          return closest;
        }
      }
      return null;
    };

    const form = resolveForm();
    if (!form) {
      return {
        ok: false as const,
        reason: 'login form not found',
      };
    }

    const inputs = Array.from(
      form.querySelectorAll('input[type="text"], input:not([type])'),
    ) as HTMLInputElement[];

    const candidates = inputs.filter((input) => {
      const id = input.id?.trim();
      if (id) {
        const lab = form.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (lab && normalizeLabel(lab.textContent ?? '') === labelNeedle) {
          return true;
        }
      }
      const wrap = input.closest('div');
      const nearby = wrap?.querySelector('label');
      return (
        nearby != null &&
        normalizeLabel(nearby.textContent ?? '') === labelNeedle
      );
    });

    if (candidates.length === 0) {
      return {
        ok: false as const,
        candidateCount: 0,
        reason: 'no Email-labeled inputs in login form',
      };
    }

    const scoreInput = (input: HTMLInputElement): number => {
      const style = window.getComputedStyle(input);
      const rect = input.getBoundingClientRect();
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        Number(style.opacity) === 0
      ) {
        return -1;
      }
      if (rect.width < 2 || rect.height < 2) {
        return -1;
      }

      let score = 0;
      if (!input.disabled) {
        score += 10;
      }
      if (!input.readOnly) {
        score += 10;
      }
      if (!input.classList.contains(a.entryDisabledClass)) {
        score += 20;
      }
      if (style.pointerEvents === 'none') {
        score -= 30;
      }
      const name = (input.name ?? '').trim();
      const id = (input.id ?? '').trim();
      if (name === 'Email' || id === 'Email') {
        score += 50;
      }
      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        score -= 20;
      }
      return score;
    };

    let best: HTMLInputElement | null = null;
    let bestScore = -1;
    for (const input of candidates) {
      const s = scoreInput(input);
      if (s > bestScore) {
        bestScore = s;
        best = input;
      }
    }

    if (!best || bestScore < 0) {
      return {
        ok: false as const,
        candidateCount: candidates.length,
        reason: 'no visible interactable Email control among decoys',
      };
    }

    const id = best.id?.trim();
    const name = best.name?.trim();
    const cssSelector = id
      ? `#${CSS.escape(id)}`
      : name
        ? `input[name="${CSS.escape(name)}"]`
        : null;

    if (!cssSelector) {
      return {
        ok: false as const,
        candidateCount: candidates.length,
        reason: 'chosen Email control has no id or name',
      };
    }

    return {
      ok: true as const,
      cssSelector,
      candidateCount: candidates.length,
    };
  }, arg);

  if (!result.ok) {
    return {
      ok: false,
      candidateCount: result.candidateCount,
      reason: result.reason,
    };
  }

  return {
    ok: true,
    cssSelector: result.cssSelector,
    candidateCount: result.candidateCount,
  };
};
