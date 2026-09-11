/// <reference lib="dom" />
import type { PortalFieldName, PortalPage, WidgetOpResult } from '../types';

export async function setDateField(
  page: PortalPage,
  name: PortalFieldName,
  isoDate: string,
): Promise<WidgetOpResult> {
  return page.evaluate(
    ({ name, isoDate }: { name: string; isoDate: string }) => {
      const el = document.querySelector(
        `input[name="${name}"]`,
      ) as HTMLInputElement | null;
      if (!el) return { ok: false, reason: `input[name=${name}] not found` };

      type KendoDate = {
        value: (d?: Date | string) => Date | void;
      };
      const w = window as unknown as {
        jQuery?: (el: Element) => {
          data: (key: string) => KendoDate | undefined;
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
    { name, isoDate },
  );
}

export async function setDropdownField(
  page: PortalPage,
  name: PortalFieldName,
  text: string,
): Promise<WidgetOpResult> {
  return page.evaluate(
    ({ name, text }: { name: string; text: string }) => {
      const el = document.querySelector(`[name="${name}"]`) as
        | HTMLSelectElement
        | HTMLInputElement
        | null;
      if (!el) return { ok: false, reason: `[name=${name}] not found` };

      type KendoDrop = {
        text: (t?: string) => string | void;
        value: (v?: string) => string | void;
      };
      const w = window as unknown as {
        jQuery?: (el: Element) => {
          data: (key: string) => KendoDrop | undefined;
        };
        __visesKendoStandIn?: {
          setDropDownList: (
            n: string,
            t: string,
          ) => { ok: boolean; reason?: string; via?: string };
          getDropDownList: (n: string) => {
            ok: boolean;
            value?: string;
            text?: string;
            visible?: string;
          };
        };
      };

      if (w.jQuery) {
        const widget = w.jQuery(el).data('kendoDropDownList');
        if (widget) {
          try {
            widget.text(text);
          } catch {
            /* try value */
          }
          let afterText =
            typeof widget.text === 'function' ? String(widget.text() ?? '') : '';
          if (afterText !== text) {
            try {
              widget.value(text);
            } catch {
              /* ignore */
            }
          }
          afterText =
            typeof widget.text === 'function' ? String(widget.text() ?? '') : '';
          const afterVal =
            typeof widget.value === 'function'
              ? String(widget.value() ?? '')
              : '';
          if (afterText !== text && afterVal !== text) {
            return {
              ok: false,
              reason: `Kendo dropdown exact match failed for "${text}"`,
            };
          }
          return {
            ok: true,
            via: 'kendoDropDownList',
            value: afterVal,
            text: afterText,
            visible: afterText,
          };
        }
      }

      if (w.__visesKendoStandIn?.setDropDownList) {
        const set = w.__visesKendoStandIn.setDropDownList(name, text);
        if (!set.ok) return set;
        const got = w.__visesKendoStandIn.getDropDownList(name);
        return {
          ok: true,
          via: set.via ?? 'standin-dropdownlist',
          value: got.value,
          text: got.text,
          visible: got.visible,
        };
      }

      if (el instanceof HTMLSelectElement) {
        let found = false;
        for (let i = 0; i < el.options.length; i++) {
          if (el.options[i].text === text || el.options[i].value === text) {
            el.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          return {
            ok: false,
            reason: `no exact option match for "${text}"`,
          };
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        const opt = el.options[el.selectedIndex];
        const via =
          el.getAttribute('data-role') === 'dropdownlist'
            ? 'standin-dropdownlist'
            : 'select';
        const disp = document.querySelector(
          `[data-dropdown-display="${name}"]`,
        );
        if (disp) disp.textContent = opt.text;
        return {
          ok: true,
          via,
          value: opt.value,
          text: opt.text,
          visible: disp?.textContent ?? opt.text,
        };
      }

      // Live Kendo-like inputs without an attached widget: set value directly.
      if (el instanceof HTMLInputElement) {
        el.focus();
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur();
        return {
          ok: el.value === text,
          via: 'dom-input',
          value: el.value,
          text: el.value,
          visible: el.value,
          reason:
            el.value === text
              ? undefined
              : `input read-back mismatch for ${name}`,
        };
      }

      return {
        ok: false,
        reason: `no Kendo/stand-in/select handler for ${name}`,
      };
    },
    { name, text },
  );
}

export async function setTextField(
  page: PortalPage,
  name: PortalFieldName,
  value: string,
): Promise<WidgetOpResult> {
  const selector = `input[name="${name}"], textarea[name="${name}"]`;
  const count = await page.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found` };
  }
  const loc = page.locator(selector).first();
  await loc.fill(value);
  const read = await loc.inputValue();
  return {
    ok: read === value,
    via: 'fill',
    value: read,
    visible: read,
    reason: read === value ? undefined : `read-back mismatch: got "${read}"`,
  };
}
