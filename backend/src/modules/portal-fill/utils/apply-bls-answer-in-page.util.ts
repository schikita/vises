/// <reference lib="dom" />
/**
 * Apply captcha-service BLS answer inside the CAPTCHA iframe document.
 * RISK-003: pure/serializable for context.evaluate — nested helpers stay in-body.
 * Uses the same decoy-aware topmost-per-slot selection as extract.
 */
import type {
  ApplyBlsAnswerInPageArg,
  ApplyBlsAnswerInPageResult,
} from '../types';

export const applyBlsAnswerInPage = (
  arg: ApplyBlsAnswerInPageArg,
): ApplyBlsAnswerInPageResult => {
  const isDisplayed = (el: Element): boolean => {
    let node: Element | null = el;
    while (node) {
      const style = window.getComputedStyle(node);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
      ) {
        return false;
      }
      node = node.parentElement;
    }
    const rect = el.getBoundingClientRect();
    return rect.width >= 8 && rect.height >= 8;
  };

  const visible = Array.from(
    document.querySelectorAll(arg.cellClickTargets),
  ).filter(
    (el): el is HTMLImageElement =>
      el instanceof HTMLImageElement && isDisplayed(el),
  );

  const slots = new Map<string, HTMLImageElement>();
  for (const img of visible) {
    const rect = img.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topImg = document
      .elementsFromPoint(cx, cy)
      .find(
        (el): el is HTMLImageElement =>
          el instanceof HTMLImageElement &&
          el.classList.contains('captcha-img'),
      );
    if (topImg !== img) continue;

    const key = `${Math.round(rect.left / 30) * 30},${Math.round(rect.top / 30) * 30}`;
    slots.set(key, img);
  }

  const targets = Array.from(slots.values()).sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    if (Math.abs(ra.top - rb.top) > arg.rowTolerancePx) {
      return ra.top - rb.top;
    }
    return ra.left - rb.left;
  });

  if (targets.length !== arg.cellCount) {
    return {
      ok: false,
      error: `expected ${arg.cellCount} visible click targets; found ${targets.length} after decoy filter`,
    };
  }
  if (arg.answer.length !== arg.cellCount) {
    return {
      ok: false,
      error: `answer length ${arg.answer.length} !== ${arg.cellCount}`,
    };
  }

  const w = window as Window & {
    Select?: (id: string, img: HTMLElement) => void;
    onSubmit?: () => void;
  };

  const clickedIndices: number[] = [];
  for (let i = 0; i < arg.answer.length; i += 1) {
    if (!arg.answer[i]) continue;
    const el = targets[i];
    if (!el) {
      return { ok: false, error: `click target[${i}] missing` };
    }
    // Prefer portal Select(id, img) so SelectedImages / img-selected stay in sync.
    const cellId = el.parentElement?.id?.trim() ?? '';
    if (cellId && typeof w.Select === 'function') {
      w.Select(cellId, el);
    } else {
      el.click();
    }
    clickedIndices.push(i);
  }

  const confirmSel = arg.confirmControl.trim();
  if (!confirmSel) {
    return {
      ok: false,
      error: 'confirm control selector is empty (expected #submit)',
    };
  }
  const confirm = document.querySelector(confirmSel) as HTMLElement | null;
  if (!confirm) {
    return {
      ok: false,
      error: `confirm control not found: ${confirmSel}`,
    };
  }

  // Prefer portal onSubmit() (writes #SelectedImages then posts captchaForm).
  if (typeof w.onSubmit === 'function') {
    w.onSubmit();
  } else {
    const actionDiv = confirm.closest('.img-action-div') as HTMLElement | null;
    (actionDiv ?? confirm).click();
  }

  return { ok: true, clickedIndices, confirmClicked: true };
};
