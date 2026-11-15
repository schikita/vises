import type { PortalWidgetSurface, WidgetOpResult } from '../types';
import { resolvePortalFieldSelector } from './resolve-portal-field-selector.util';

/**
 * Check/uncheck a section toggle checkbox by `#id`.
 */
export const setEditMemberCheckboxField = async (
  surface: PortalWidgetSurface,
  fieldId: string,
  checked: boolean,
): Promise<WidgetOpResult> => {
  const selector = resolvePortalFieldSelector(fieldId);
  return surface.evaluate(
    ({
      selector: sel,
      checked: want,
    }: {
      selector: string;
      checked: boolean;
    }) => {
      const el = document.querySelector(sel) as HTMLInputElement | null;
      if (!el) {
        return { ok: false as const, reason: `${sel} not found` };
      }
      if (el.checked !== want) {
        el.click();
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (el.checked !== want) {
        return {
          ok: false as const,
          reason: `checkbox commit failed for ${sel}`,
        };
      }
      return {
        ok: true as const,
        via: 'checkbox',
        value: want ? 'true' : 'false',
      };
    },
    { selector, checked },
  );
};
