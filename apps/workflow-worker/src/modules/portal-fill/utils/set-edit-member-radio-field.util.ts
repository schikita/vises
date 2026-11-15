import type { PortalWidgetSurface, WidgetOpResult } from '../types';

/**
 * Select radio by `name` + `value` (REQ-012 — duplicate ids in DOM).
 */
export const setEditMemberRadioField = async (
  surface: PortalWidgetSurface,
  name: string,
  value: string,
): Promise<WidgetOpResult> => {
  const result = await surface.evaluate(
    ({ name: radioName, value: radioValue }: { name: string; value: string }) => {
      const matches = Array.from(
        document.querySelectorAll(
          `input[type="radio"][name="${radioName}"]`,
        ),
      ) as HTMLInputElement[];
      if (matches.length === 0) {
        return {
          ok: false as const,
          reason: `radio name=${radioName} not found`,
        };
      }
      const target = matches.find((el) => el.value === radioValue);
      if (!target) {
        return {
          ok: false as const,
          reason: `radio name=${radioName} value option missing`,
        };
      }
      target.click();
      target.dispatchEvent(new Event('change', { bubbles: true }));
      const checked = document.querySelector(
        `input[type="radio"][name="${radioName}"]:checked`,
      ) as HTMLInputElement | null;
      const after = checked?.value ?? '';
      if (after !== radioValue) {
        return {
          ok: false as const,
          reason: `radio read-back mismatch name=${radioName}`,
        };
      }
      return { ok: true as const, via: 'radio-name-value', value: after };
    },
    { name, value },
  );
  return result;
};
