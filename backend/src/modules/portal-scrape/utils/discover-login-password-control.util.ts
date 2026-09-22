import { PORTAL_LOGIN_SELECTORS } from '../constants';
import type {
  DiscoverLoginPasswordControlResult,
  PortalPage,
} from '../types';

type DiscoverArg = {
  captchaFormActionSubstring: string;
  formActionSubstring: string;
  verifyControl: string;
  passwordLabelText: string;
  entryDisabledClass: string;
};

/**
 * Discover the real Password input among decoys on the login captcha page
 * (REQ-011 / fixture `login_captcha.html`). Never hardcodes sample ids.
 */
export const discoverLoginPasswordControl = async (
  page: PortalPage,
): Promise<DiscoverLoginPasswordControlResult> => {
  const arg: DiscoverArg = {
    captchaFormActionSubstring:
      PORTAL_LOGIN_SELECTORS.captchaFormActionSubstring,
    formActionSubstring: PORTAL_LOGIN_SELECTORS.formActionSubstring,
    verifyControl: PORTAL_LOGIN_SELECTORS.verifyControl,
    passwordLabelText: PORTAL_LOGIN_SELECTORS.passwordLabelText,
    entryDisabledClass: PORTAL_LOGIN_SELECTORS.entryDisabledClass,
  };

  const result = await page.evaluate((a: DiscoverArg) => {
    const normalizeLabel = (text: string): string =>
      text.replace(/\s+/g, ' ').replace(/\*/g, '').trim().toLowerCase();

    const labelNeedle = normalizeLabel(a.passwordLabelText);

    const resolveRoot = (): ParentNode => {
      const forms = Array.from(document.querySelectorAll('form'));
      const captchaForm = forms.find((f) =>
        (f.getAttribute('action') ?? '').includes(a.captchaFormActionSubstring),
      );
      if (captchaForm) {
        const captchaDiv = captchaForm.closest('.captcha-div') ?? document;
        return captchaDiv;
      }
      const loginForm = forms.find((f) =>
        (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
      );
      if (loginForm) {
        return loginForm;
      }
      const verify = document.querySelector(a.verifyControl);
      if (verify) {
        const closest = verify.closest('form') ?? verify.closest('.captcha-div');
        if (closest) {
          return closest;
        }
      }
      return document;
    };

    const root = resolveRoot();
    const inputs = Array.from(
      root.querySelectorAll('input[type="password"]'),
    ) as HTMLInputElement[];

    const candidates = inputs.filter((input) => {
      const id = input.id?.trim();
      if (id) {
        const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
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
        reason: 'no Password-labeled inputs on login page',
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
      if (name === 'Password' || id === 'Password') {
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
        reason: 'no visible interactable Password control among decoys',
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
        reason: 'chosen Password control has no id or name',
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
