import {
  EDIT_MEMBER_CHECKBOX_FIELD_IDS,
  EDIT_MEMBER_DATE_FIELD_IDS,
  EDIT_MEMBER_DROPDOWN_FIELD_IDS,
  EDIT_MEMBER_RADIO_FIELD_IDS,
  PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
} from '../constants';
import type {
  EditMemberFieldCurrentValue,
  PortalWidgetSurface,
} from '../types';
import { isPortalDropdownUnselectedText } from './is-portal-dropdown-unselected-text.util';
import { resolvePortalFieldSelector } from './resolve-portal-field-selector.util';

/**
 * Read live control value for already-correct skip (no PII logged by caller).
 */
export const readEditMemberFieldCurrentValue = async (
  surface: PortalWidgetSurface,
  fieldId: string,
): Promise<EditMemberFieldCurrentValue> => {
  const selector = resolvePortalFieldSelector(fieldId);

  if (EDIT_MEMBER_RADIO_FIELD_IDS.has(fieldId)) {
    const value = await surface.evaluate((name: string) => {
      const checked = document.querySelector(
        `input[type="radio"][name="${name}"]:checked`,
      ) as HTMLInputElement | null;
      return checked?.value ?? '';
    }, fieldId);
    return { kind: 'radio', value };
  }

  if (EDIT_MEMBER_CHECKBOX_FIELD_IDS.has(fieldId)) {
    const checked = await surface.evaluate((sel: string) => {
      const el = document.querySelector(sel) as HTMLInputElement | null;
      return el?.checked === true;
    }, selector);
    return { kind: 'checkbox', value: checked ? 'true' : 'false' };
  }

  if (EDIT_MEMBER_DATE_FIELD_IDS.has(fieldId)) {
    const value = await surface.evaluate(
      ({
        selector: sel,
        staleDefault,
      }: {
        selector: string;
        staleDefault: string;
      }) => {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        if (!el) return { missing: true as const, value: '' };
        const display = String(el.value ?? '').trim();
        type KendoDatePickerWidget = {
          value: (d?: Date | string) => Date | null | void;
        };
        type JqHandle = {
          data: (key: string) => KendoDatePickerWidget | undefined;
        };
        const w = window as unknown as {
          jQuery?: (el: Element) => JqHandle;
          $?: (el: Element) => JqHandle;
        };
        const jq = w.jQuery ?? w.$;
        if (jq) {
          const widget = jq(el).data('kendoDatePicker');
          const read = widget?.value?.();
          if (read instanceof Date && !Number.isNaN(read.getTime())) {
            const y = read.getFullYear();
            const m = String(read.getMonth() + 1).padStart(2, '0');
            const d = String(read.getDate()).padStart(2, '0');
            const ymd = `${y}-${m}-${d}`;
            if (ymd === staleDefault) {
              return { missing: false as const, value: '' };
            }
            return { missing: false as const, value: ymd };
          }
        }
        if (!display || display === staleDefault) {
          return { missing: false as const, value: '' };
        }
        return { missing: false as const, value: display.slice(0, 10) };
      },
      { selector, staleDefault: PORTAL_DATEPICKER_STALE_DEFAULT_YMD },
    );
    if (value.missing) {
      return { kind: 'missing', value: '' };
    }
    return { kind: 'date', value: value.value };
  }

  if (EDIT_MEMBER_DROPDOWN_FIELD_IDS.has(fieldId)) {
    const read = await surface.evaluate((sel: string) => {
      const el = document.querySelector(sel) as
        | HTMLSelectElement
        | HTMLInputElement
        | null;
      if (!el) return { missing: true as const, text: '', bound: '' };

      type KendoDropdownWidget = {
        text: (t?: string) => string | void;
        value: (v?: string) => string | void;
      };
      type JqHandle = {
        data: (key: string) => KendoDropdownWidget | undefined;
      };
      const w = window as unknown as {
        jQuery?: (el: Element) => JqHandle;
        $?: (el: Element) => JqHandle;
      };
      const jq = w.jQuery ?? w.$;
      if (jq) {
        const widget =
          jq(el).data('kendoDropDownList') ?? jq(el).data('kendoComboBox');
        if (widget) {
          return {
            missing: false as const,
            text: String(widget.text?.() ?? ''),
            bound: String(widget.value?.() ?? ''),
          };
        }
      }
      if (el instanceof HTMLSelectElement) {
        const opt = el.options[el.selectedIndex];
        return {
          missing: false as const,
          text: String(opt?.text ?? ''),
          bound: String(opt?.value ?? ''),
        };
      }
      return {
        missing: false as const,
        text: String(el.value ?? ''),
        bound: String(el.value ?? ''),
      };
    }, selector);
    if (read.missing) {
      return { kind: 'missing', value: '' };
    }
    const text = read.text.trim();
    if (isPortalDropdownUnselectedText(text) || !text) {
      return { kind: 'dropdown', value: '', boundValue: '' };
    }
    return { kind: 'dropdown', value: text, boundValue: read.bound };
  }

  const text = await surface.evaluate((sel: string) => {
    const el = document.querySelector(sel) as HTMLInputElement | null;
    if (!el) return { missing: true as const, value: '' };
    return { missing: false as const, value: String(el.value ?? '') };
  }, selector);
  if (text.missing) {
    return { kind: 'missing', value: '' };
  }
  return { kind: 'text', value: text.value.trim() };
};
