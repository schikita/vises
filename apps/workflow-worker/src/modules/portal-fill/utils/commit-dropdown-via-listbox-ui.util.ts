/// <reference lib="dom" />
import {
  PORTAL_DROPDOWN_LISTBOX_ID_SUFFIX,
  PORTAL_DROPDOWN_LISTBOX_SELECT_SELECTOR,
  PORTAL_DROPDOWN_LIST_FILTER_SELECTOR,
  PORTAL_DROPDOWN_LIST_ID_SUFFIX,
  PORTAL_DROPDOWN_LIST_OPTION_SELECTOR,
  PORTAL_DROPDOWN_UNSELECTED_LABELS,
  PORTAL_DROPDOWN_WIDGET_HOST_SELECTOR,
} from '../constants';
import type {
  PortalWidgetFieldName,
  PortalWidgetSurface,
  WidgetOpResult,
} from '../types';
import { resolvePortalFieldSelector } from './resolve-portal-field-selector.util';

/**
 * Listbox UI commit for RegisterUser Kendo DropDownList/ComboBox.
 * Open chrome → optional filter → click matching `li.k-item` so Kendo binds
 * the option GUID (not display-only text paint).
 */
export const commitDropdownViaListboxUi = async (
  surface: PortalWidgetSurface,
  name: PortalWidgetFieldName,
  text: string,
): Promise<WidgetOpResult> => {
  const selector = resolvePortalFieldSelector(name);
  return surface.evaluate(
    ({
      selector,
      name,
      text,
      unselectedLabels,
      widgetHostSelector,
      selectSelector,
      listIdSuffix,
      listboxIdSuffix,
      filterSelector,
      optionSelector,
    }: {
      selector: string;
      name: string;
      text: string;
      unselectedLabels: readonly string[];
      widgetHostSelector: string;
      selectSelector: string;
      listIdSuffix: string;
      listboxIdSuffix: string;
      filterSelector: string;
      optionSelector: string;
    }) => {
      const el = document.querySelector(selector) as
        | HTMLSelectElement
        | HTMLInputElement
        | null;
      if (!el) {
        return {
          ok: false,
          reason: `listbox ui: ${selector} not found`,
          via: 'chrome-listbox',
        };
      }

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
        open?: () => void;
        close?: () => void;
        select?: (index: number) => void;
        dataSource?: {
          data: () => KendoOptionRow[];
        };
      };

      type JqHandle = {
        data: (key: string) => KendoDropdownWidget | undefined;
        getKendoDropDownList?: () => KendoDropdownWidget | undefined;
        getKendoComboBox?: () => KendoDropdownWidget | undefined;
      };

      const isUnselectedText = (candidate: string): boolean =>
        unselectedLabels.includes(String(candidate ?? '').trim());

      const resolveWidget = (): KendoDropdownWidget | null => {
        const w = window as unknown as {
          jQuery?: (el: Element) => JqHandle;
          $?: (el: Element) => JqHandle;
          kendo?: {
            widgetInstance?: (el: Element) => KendoDropdownWidget | undefined;
          };
        };
        const jq = w.jQuery ?? w.$;
        if (jq) {
          const jqEl = jq(el);
          const fromDropDown = jqEl.data('kendoDropDownList');
          if (fromDropDown) return fromDropDown;
          const fromCombo = jqEl.data('kendoComboBox');
          if (fromCombo) return fromCombo;
          if (typeof jqEl.getKendoDropDownList === 'function') {
            const got = jqEl.getKendoDropDownList();
            if (got) return got;
          }
          if (typeof jqEl.getKendoComboBox === 'function') {
            const got = jqEl.getKendoComboBox();
            if (got) return got;
          }
        }
        if (typeof w.kendo?.widgetInstance === 'function') {
          const instance = w.kendo.widgetInstance(el);
          if (instance && typeof instance.value === 'function') return instance;
        }
        return null;
      };

      const readBoundIdFromDataSource = (
        widget: KendoDropdownWidget,
        intended: string,
      ): string => {
        if (!widget.dataSource?.data) return '';
        try {
          const rows = widget.dataSource.data() ?? [];
          const match = rows.find(
            (row) => String(row.Name ?? row.text ?? '').trim() === intended,
          );
          if (!match) return '';
          return String(
            match.Id ?? match.Value ?? match.value ?? '',
          ).trim();
        } catch {
          return '';
        }
      };

      const chromeHost =
        el.closest(widgetHostSelector) ??
        el.closest('.k-widget') ??
        null;
      if (!chromeHost) {
        return {
          ok: false,
          reason: `listbox ui: chrome not found for ${name}`,
          via: 'chrome-listbox',
        };
      }

      const role = String(el.getAttribute('data-role') ?? '').toLowerCase();
      const chromeEligible =
        el instanceof HTMLInputElement &&
        (role === 'dropdownlist' || role === 'combobox');
      if (!chromeEligible) {
        return {
          ok: false,
          reason: `listbox ui: chrome not eligible for ${name}`,
          via: 'chrome-listbox',
        };
      }

      const expanded =
        chromeHost.getAttribute('aria-expanded') === 'true' ||
        chromeHost.classList.contains('k-state-border-down') ||
        chromeHost.classList.contains('k-state-border-up');

      if (!expanded) {
        const selectBtn = chromeHost.querySelector(selectSelector);
        if (selectBtn instanceof HTMLElement) {
          selectBtn.click();
        } else if (chromeHost instanceof HTMLElement) {
          chromeHost.click();
        } else {
          const widget = resolveWidget();
          if (widget && typeof widget.open === 'function') {
            try {
              widget.open();
            } catch {
              /* ignore */
            }
          }
        }
      }

      const listboxId =
        chromeHost.getAttribute('aria-owns')?.trim() ||
        `${name}${listboxIdSuffix}`;
      const listPopupId = `${name}${listIdSuffix}`;

      let listbox =
        document.getElementById(listboxId) ??
        document.getElementById(listPopupId)?.querySelector(
          `#${CSS.escape(listboxId)}, ul.k-list, [data-role="staticlist"]`,
        ) ??
        null;

      if (!listbox) {
        listbox = document.querySelector(
          `#${CSS.escape(listPopupId)} ul.k-list, .k-animation-container ul.k-list#${CSS.escape(listboxId)}, .k-animation-container #${CSS.escape(listboxId)}`,
        );
      }

      if (!listbox) {
        return {
          ok: false,
          reason: `listbox ui: listbox not found (${listboxId}) for ${name}`,
          via: 'chrome-listbox',
        };
      }

      const popupRoot =
        document.getElementById(listPopupId) ??
        listbox.closest('.k-list-container, .k-animation-container') ??
        listbox.parentElement;

      const filterInput =
        popupRoot?.querySelector(filterSelector) ??
        document.querySelector(
          `#${CSS.escape(listPopupId)} ${filterSelector}`,
        );

      const findOption = (): HTMLElement | null => {
        const nodes = Array.from(listbox.querySelectorAll(optionSelector));
        const hit = nodes.find(
          (node) => String(node.textContent ?? '').trim() === text,
        );
        return hit instanceof HTMLElement ? hit : null;
      };

      let match = findOption();

      if (!match && filterInput instanceof HTMLInputElement) {
        filterInput.focus();
        filterInput.value = '';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
        filterInput.value = text;
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
        filterInput.dispatchEvent(
          new KeyboardEvent('keyup', {
            bubbles: true,
            key: text.slice(-1) || 'a',
          }),
        );
        match = findOption();
      }

      if (!(match instanceof HTMLElement)) {
        return {
          ok: false,
          reason: `listbox ui: option "${text}" not found for ${name}`,
          via: 'chrome-listbox',
        };
      }

      match.scrollIntoView({ block: 'nearest' });
      match.click();

      const widget = resolveWidget();
      if (widget && typeof widget.trigger === 'function') {
        try {
          widget.trigger('change');
        } catch {
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const kInput = chromeHost.querySelector('.k-input');
      const afterText = String(
        (widget && typeof widget.text === 'function'
          ? widget.text()
          : null) ??
          kInput?.textContent ??
          '',
      ).trim();
      const afterVal = String(
        (widget && typeof widget.value === 'function'
          ? widget.value()
          : null) ??
          el.value ??
          '',
      ).trim();

      if (afterText !== text || isUnselectedText(afterText)) {
        return {
          ok: false,
          reason: `listbox ui: text mismatch after click for "${text}" (got=${afterText || '(empty)'})`,
          via: 'chrome-listbox',
          value: afterVal,
          text: afterText,
          visible: afterText,
        };
      }

      if (!afterVal) {
        return {
          ok: false,
          reason: `listbox ui: bound value empty after click for "${text}" (GUID not committed)`,
          via: 'chrome-listbox',
          value: afterVal,
          text: afterText,
          visible: afterText,
        };
      }

      // Prefer dataSource Id/GUID when available — reject label-only binding.
      if (widget) {
        const expectedId = readBoundIdFromDataSource(widget, text);
        if (expectedId && afterVal !== expectedId) {
          return {
            ok: false,
            reason: `listbox ui: bound value mismatch for "${text}" (expected=${expectedId} got=${afterVal})`,
            via: 'chrome-listbox',
            value: afterVal,
            text: afterText,
            visible: afterText,
          };
        }
      }

      if (widget && typeof widget.close === 'function') {
        try {
          widget.close();
        } catch {
          /* ignore */
        }
      }

      return {
        ok: true,
        via: 'chrome-listbox',
        value: afterVal,
        text: afterText,
        visible: afterText,
      };
    },
    {
      selector,
      name,
      text,
      unselectedLabels: [...PORTAL_DROPDOWN_UNSELECTED_LABELS],
      widgetHostSelector: PORTAL_DROPDOWN_WIDGET_HOST_SELECTOR,
      selectSelector: PORTAL_DROPDOWN_LISTBOX_SELECT_SELECTOR,
      listIdSuffix: PORTAL_DROPDOWN_LIST_ID_SUFFIX,
      listboxIdSuffix: PORTAL_DROPDOWN_LISTBOX_ID_SUFFIX,
      filterSelector: PORTAL_DROPDOWN_LIST_FILTER_SELECTOR,
      optionSelector: PORTAL_DROPDOWN_LIST_OPTION_SELECTOR,
    },
  );
};
