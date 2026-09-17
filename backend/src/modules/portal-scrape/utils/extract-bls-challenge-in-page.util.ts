/// <reference lib="dom" />
/**
 * Runs inside the CAPTCHA iframe document.
 * RISK-003: pure/serializable for context.evaluate — nested helpers stay in-body.
 */
import type {
  ExtractBlsChallengeInPageArg,
  ExtractBlsChallengeInPageResult,
} from '../types';

export const extractBlsChallengeInPage = (
  arg: ExtractBlsChallengeInPageArg,
): ExtractBlsChallengeInPageResult => {
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

  /**
   * Keep only the topmost painted captcha-img per snapped grid slot
   * (decoys stack under the real cell).
   */
  const pickVisibleGridCells = (): HTMLImageElement[] => {
    const visible = Array.from(
      document.querySelectorAll(arg.cellImages),
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

    return Array.from(slots.values()).sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      if (Math.abs(ra.top - rb.top) > arg.rowTolerancePx) {
        return ra.top - rb.top;
      }
      return ra.left - rb.left;
    });
  };

  const candidates = pickVisibleGridCells();
  if (candidates.length !== arg.cellCount) {
    return {
      ok: false,
      error: `expected ${arg.cellCount} visible CAPTCHA cell images; found ${candidates.length} after decoy filter`,
    };
  }

  const imagesBase64: string[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const el = candidates[i];
    let dataUri: string | null = null;

    const src = el.currentSrc || el.src || '';
    if (src.startsWith('data:')) {
      dataUri = src;
    } else if (src) {
      const canvas = document.createElement('canvas');
      const w = el.naturalWidth || el.width || 0;
      const h = el.naturalHeight || el.height || 0;
      if (w <= 0 || h <= 0) {
        return {
          ok: false,
          error: `cell[${i}] image has no dimensions (src may be unloaded)`,
        };
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { ok: false, error: `cell[${i}] canvas 2d context unavailable` };
      }
      try {
        ctx.drawImage(el, 0, 0);
        dataUri = canvas.toDataURL('image/png');
      } catch {
        return {
          ok: false,
          error: `cell[${i}] drawImage/toDataURL failed (possible CORS)`,
        };
      }
    }

    const trimmedDataUri = dataUri?.trim() ?? '';
    if (!trimmedDataUri) {
      return {
        ok: false,
        error: `cell[${i}] could not extract image bytes`,
      };
    }
    // Raw data-URI (or equivalent); host strips `;base64,` once via stripDataUriPrefix.
    imagesBase64.push(trimmedDataUri);
  }

  const taskPattern = new RegExp(
    arg.taskArgumentPatternSource,
    arg.taskArgumentPatternFlags,
  );
  const labels = Array.from(document.querySelectorAll(arg.taskArgument)).filter(
    (el) => {
      if (!isDisplayed(el)) return false;
      const color = window.getComputedStyle(el).color;
      if (color === arg.decoyLabelColorRgb) return false;
      return true;
    },
  );

  if (labels.length === 0) {
    return {
      ok: false,
      error: 'TaskArgument label not found (no visible non-decoy .box-label)',
    };
  }

  let taskArgument: string | undefined;
  for (const label of labels) {
    const text = (label.textContent ?? '').trim();
    const match = taskPattern.exec(text);
    if (match?.[1]) {
      taskArgument = match[1];
      break;
    }
  }

  if (!taskArgument) {
    return {
      ok: false,
      error: `TaskArgument text did not match expected pattern: "${(labels[0].textContent ?? '').trim()}"`,
    };
  }

  return { ok: true, imagesBase64, taskArgument };
};
