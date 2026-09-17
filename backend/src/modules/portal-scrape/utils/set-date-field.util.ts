/// <reference lib="dom" />
import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalFieldName, PortalPage, WidgetOpResult } from '../types';

export const setDateField = async (
  page: PortalPage,
  name: PortalFieldName,
  isoDate: string,
): Promise<WidgetOpResult> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields[name];
  return page.evaluate(
    ({
      selector,
      name,
      isoDate,
    }: {
      selector: string;
      name: string;
      isoDate: string;
    }) => {
      const el = document.querySelector(selector) as HTMLInputElement | null;
      if (!el) return { ok: false, reason: `${selector} not found` };

      const w = window as unknown as {
        jQuery?: (el: Element) => {
          data: (key: string) =>
            | { value: (d?: Date | string) => Date | void }
            | undefined;
        };
        __visesKendoStandIn?: {
          setDatePicker: (
            n: string,
            v: string,
          ) => { ok: boolean; reason?: string; via?: string };
          getDatePicker: (n: string) => {
            ok: boolean;
            value?: string;
            visible?: string;
          };
        };
      };

      if (w.jQuery) {
        const widget = w.jQuery(el).data('kendoDatePicker');
        if (widget) {
          const d = new Date(isoDate);
          if (Number.isNaN(d.getTime())) {
            return { ok: false, reason: `invalid date: ${isoDate}` };
          }
          widget.value(d);
          const read = widget.value() as Date;
          const visible =
            read instanceof Date && !Number.isNaN(read.getTime())
              ? read.toISOString().slice(0, 10)
              : String(el.value ?? '');
          return { ok: true, via: 'kendoDatePicker', value: visible, visible };
        }
      }

      if (w.__visesKendoStandIn?.setDatePicker) {
        const set = w.__visesKendoStandIn.setDatePicker(name, isoDate);
        if (!set.ok) return set;
        const got = w.__visesKendoStandIn.getDatePicker(name);
        return {
          ok: true,
          via: set.via ?? 'standin-datepicker',
          value: got.value,
          visible: got.visible,
        };
      }

      if (el.getAttribute('data-role') === 'datepicker') {
        el.removeAttribute('readonly');
        el.value = isoDate;
        el.setAttribute('readonly', 'readonly');
        el.dispatchEvent(new Event('change', { bubbles: true }));
        const disp = document.querySelector(
          `[data-datepicker-display="${name}"]`,
        );
        if (disp) disp.textContent = isoDate;
        const visible = disp?.textContent ?? el.value;
        return {
          ok: true,
          via: 'standin-datepicker',
          value: el.value,
          visible,
        };
      }

      el.value = isoDate;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return {
        ok: true,
        via: 'dom-input',
        value: el.value,
        visible: el.value,
      };
    },
    { selector, name, isoDate },
  );
};
