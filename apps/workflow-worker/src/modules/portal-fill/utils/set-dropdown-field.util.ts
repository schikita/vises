/// <reference lib="dom" />
import { PORTAL_DROPDOWN_UNSELECTED_LABELS } from '../constants';
import type {
  PortalWidgetFieldName,
  PortalWidgetSurface,
  WidgetOpResult,
} from '../types';
import { commitDropdownViaListboxUi } from './commit-dropdown-via-listbox-ui.util';
import { resolvePortalFieldSelector } from './resolve-portal-field-selector.util';

/**
 * Set a portal Kendo/DOM dropdown by exact option text.
 * Prefers listbox UI clicks (open → filter → click `li.k-item`) so Kendo
 * binds the option GUID. Falls back to widget API / stand-in / native select
 * when chrome/listbox UI cannot commit (harness or missing popup).
 */
export const setDropdownField = async (
  surface: PortalWidgetSurface,
  name: PortalWidgetFieldName,
  text: string,
): Promise<WidgetOpResult> => {
  const uiResult = await commitDropdownViaListboxUi(surface, name, text);
  if (uiResult.ok) return uiResult;

  const selector = resolvePortalFieldSelector(name);
  const apiResult = await surface.evaluate(
    ({
      selector,
      name,
      text,
      unselectedLabels,
    }: {
      selector: string;
      name: string;
      text: string;
      unselectedLabels: readonly string[];
    }) => {
      const el = document.querySelector(selector) as
        | HTMLSelectElement
        | HTMLInputElement
        | null;
      if (!el) return { ok: false, reason: `${selector} not found` };

      type KendoOptionRow = {
        Name?: string;
        text?: string;
        Id?: string;
        Value?: string;
        value?: string;
      };

      type KendoDropdownWidget = {
        text: (t?: string) => string | void;
        value: (v?: string) => string | void;
        trigger?: (eventName: string) => void;
        dataSource?: {
          data: () => KendoOptionRow[];
        };
        open?: () => void;
      };

      type JqHandle = {
        data: (key: string) => KendoDropdownWidget | undefined;
        getKendoDropDownList?: () => KendoDropdownWidget | undefined;
        getKendoComboBox?: () => KendoDropdownWidget | undefined;
      };

      const isUnselectedText = (candidate: string): boolean =>
        unselectedLabels.includes(String(candidate ?? '').trim());

      const notifyWidgetChange = (
        widget: {
          trigger?: (eventName: string) => void;
        },
        input: Element,
      ): void => {
        if (typeof widget.trigger === 'function') {
          try {
            widget.trigger('change');
            return;
          } catch {
            /* fall through to DOM */
          }
        }
        input.dispatchEvent(new Event('change', { bubbles: true }));
        if (input instanceof HTMLElement) {
          input.blur();
        }
      };

      const w = window as unknown as {
        jQuery?: (el: Element) => JqHandle;
        $?: (el: Element) => JqHandle;
        kendo?: {
          widgetInstance?: (el: Element) => KendoDropdownWidget | undefined;
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

      const readOptionsFromSelect = (
        select: HTMLSelectElement,
      ): Array<{ value: string; text: string }> =>
        Array.from(select.options).map((o) => ({
          value: o.value,
          text: o.text,
        }));

      const readOptionsFromWidget = (widget: {
        dataSource?: {
          data: () => KendoOptionRow[];
        };
      }): Array<{ value: string; text: string }> => {
        if (!widget.dataSource?.data) return [];
        try {
          const rows = widget.dataSource.data() ?? [];
          return rows
            .map((row) => ({
              value: String(row.Id ?? row.Value ?? row.value ?? ''),
              text: String(row.Name ?? row.text ?? ''),
            }))
            .filter((o) => o.text.trim().length > 0);
        } catch {
          return [];
        }
      };

      const resolveOptionByExactText = (
        options: Array<{ value: string; text: string }>,
        intended: string,
      ): { value: string; text: string } | null => {
        const matches = options.filter((o) => o.text === intended);
        if (matches.length === 0) return null;
        return matches[0];
      };

      const isCommittedSelection = (
        afterText: string,
        afterVal: string,
        resolved: { value: string; text: string },
      ): boolean => {
        if (afterText !== text) return false;
        if (isUnselectedText(afterText)) return false;
        if (!afterVal.trim()) return false;
        // When dataSource provides a distinct Id/GUID, require that binding.
        if (resolved.value && resolved.value !== resolved.text) {
          return afterVal === resolved.value;
        }
        if (afterVal === resolved.value) return true;
        if (afterVal === resolved.text || afterVal === text) return true;
        return false;
      };

      const commitViaWidget = (
        widget: KendoDropdownWidget,
        via: 'kendoDropDownList' | 'kendoComboBox',
      ): WidgetOpResult => {
        if (
          typeof widget.open === 'function' &&
          readOptionsFromWidget(widget).length === 0
        ) {
          try {
            widget.open();
          } catch {
            /* ignore */
          }
        }

        let options = readOptionsFromWidget(widget);
        if (options.length === 0 && el instanceof HTMLSelectElement) {
          options = readOptionsFromSelect(el);
        }

        const resolved = resolveOptionByExactText(options, text);
        if (!resolved) {
          return {
            ok: false,
            reason: `Kendo ${via} exact match failed for "${text}"`,
          };
        }
        if (!resolved.value.trim()) {
          return {
            ok: false,
            reason: `Kendo ${via} option "${text}" has empty Id/GUID`,
          };
        }

        try {
          widget.value(resolved.value);
        } catch {
          return {
            ok: false,
            reason: `Kendo ${via} value set failed for "${text}"`,
          };
        }

        notifyWidgetChange(widget, el);

        const afterText =
          typeof widget.text === 'function' ? String(widget.text() ?? '') : '';
        const afterVal =
          typeof widget.value === 'function'
            ? String(widget.value() ?? '')
            : '';

        if (!isCommittedSelection(afterText, afterVal, resolved)) {
          return {
            ok: false,
            reason: `Kendo ${via} commit failed for "${text}" (text=${afterText || '(empty)'} value=${afterVal || '(empty)'})`,
          };
        }

        return {
          ok: true,
          via,
          value: afterVal,
          text: afterText,
          visible: afterText,
        };
      };

      // DEC-010: jq = jQuery || $; .data → getKendo* → widgetInstance.
      const jq = w.jQuery ?? w.$;
      if (jq) {
        const jqEl = jq(el);
        const probes: Array<{
          via: 'kendoDropDownList' | 'kendoComboBox';
          get: () => KendoDropdownWidget | undefined;
        }> = [
          {
            via: 'kendoDropDownList',
            get: () => jqEl.data('kendoDropDownList'),
          },
          {
            via: 'kendoComboBox',
            get: () => jqEl.data('kendoComboBox'),
          },
          {
            via: 'kendoDropDownList',
            get: () =>
              typeof jqEl.getKendoDropDownList === 'function'
                ? jqEl.getKendoDropDownList()
                : undefined,
          },
          {
            via: 'kendoComboBox',
            get: () =>
              typeof jqEl.getKendoComboBox === 'function'
                ? jqEl.getKendoComboBox()
                : undefined,
          },
        ];
        for (const probe of probes) {
          const widget = probe.get();
          if (!widget) continue;
          return commitViaWidget(widget, probe.via);
        }
      }

      if (typeof w.kendo?.widgetInstance === 'function') {
        const instance = w.kendo.widgetInstance(el);
        if (instance && typeof instance.value === 'function') {
          const role = String(el.getAttribute('data-role') ?? '').toLowerCase();
          const via: 'kendoDropDownList' | 'kendoComboBox' =
            role === 'combobox' ? 'kendoComboBox' : 'kendoDropDownList';
          return commitViaWidget(instance, via);
        }
      }

      if (w.__visesKendoStandIn?.setDropDownList) {
        const set = w.__visesKendoStandIn.setDropDownList(name, text);
        if (!set.ok) return set;
        const got = w.__visesKendoStandIn.getDropDownList(name);
        const afterText = String(got.text ?? got.visible ?? '');
        const afterVal = String(got.value ?? '');
        if (
          afterText !== text ||
          isUnselectedText(afterText) ||
          !afterVal.trim()
        ) {
          return {
            ok: false,
            reason: `stand-in dropdown commit failed for "${text}" (text=${afterText || '(empty)'} value=${afterVal || '(empty)'})`,
          };
        }
        return {
          ok: true,
          via: set.via ?? 'standin-dropdownlist',
          value: afterVal,
          text: afterText,
          visible: got.visible ?? afterText,
        };
      }

      if (el instanceof HTMLSelectElement) {
        const options = readOptionsFromSelect(el);
        const resolved = resolveOptionByExactText(options, text);
        if (!resolved) {
          return {
            ok: false,
            reason: `no exact option match for "${text}"`,
          };
        }
        let foundIndex = -1;
        for (let i = 0; i < el.options.length; i++) {
          if (el.options[i].text === text) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex < 0) {
          return {
            ok: false,
            reason: `no exact option match for "${text}"`,
          };
        }
        el.selectedIndex = foundIndex;
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
        const afterText = opt.text;
        const afterVal = String(opt.value ?? '');
        if (
          afterText !== text ||
          isUnselectedText(afterText) ||
          !afterVal.trim()
        ) {
          return {
            ok: false,
            reason: `select commit failed for "${text}" (text=${afterText || '(empty)'} value=${afterVal || '(empty)'})`,
          };
        }
        return {
          ok: true,
          via,
          value: afterVal,
          text: afterText,
          visible: disp?.textContent ?? afterText,
        };
      }

      // DEC-003: refuse bare display-only input paint.
      if (el instanceof HTMLInputElement) {
        const painted = String(
          el
            .closest('.k-widget')
            ?.querySelector('.k-input')
            ?.textContent ??
            el.value ??
            '',
        ).trim();
        return {
          ok: false,
          reason: `no Kendo/stand-in/select handler for ${name}; refusing display-only input paint (value=${painted || '(empty)'})`,
        };
      }

      return {
        ok: false,
        reason: `no Kendo/stand-in/select handler for ${name}`,
      };
    },
    {
      selector,
      name,
      text,
      unselectedLabels: [...PORTAL_DROPDOWN_UNSELECTED_LABELS],
    },
  );

  if (apiResult.ok) return apiResult;

  // Prefer the more specific listbox UI failure when both paths failed.
  if (uiResult.reason && !String(uiResult.reason).includes('chrome not found')) {
    return uiResult;
  }
  return apiResult;
};
