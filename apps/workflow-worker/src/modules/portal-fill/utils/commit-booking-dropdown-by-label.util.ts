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
import type { PortalPage, WidgetOpResult } from '../types';

type CommitArg = {
  labelText: string;
  matchText: string;
  unselectedLabels: readonly string[];
  widgetHostSelector: string;
  selectSelector: string;
  listIdSuffix: string;
  listboxIdSuffix: string;
  filterSelector: string;
  optionSelector: string;
};

/**
 * Commit a Visa Type Selection Kendo dropdown by visible label + option text
 * via listbox UI (open → optional filter → click option). Never hardcodes
 * obfuscated dump ids (REQ-011). Reuses PORTAL_DROPDOWN_* listbox constants.
 */
export const commitBookingDropdownByLabel = async (
  page: PortalPage,
  labelText: string,
  matchText: string,
): Promise<WidgetOpResult> => {
  const intended = matchText.trim();
  if (!intended) {
    return { ok: false, reason: 'booking dropdown: empty match text' };
  }

  return page.evaluate(
    (a: CommitArg): WidgetOpResult => {
      const collapse = (text: string): string =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();
      const needleLabel = collapse(a.labelText);
      const needleOption = collapse(a.matchText);

      const isDisplayed = (el: Element | null): boolean => {
        if (!(el instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
        if (Number(style.opacity) === 0) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      type OptionRow = { value: string; text: string };

      type KendoDropdownWidget = {
        text: (t?: string) => string | void;
        value: (v?: string) => string | void;
        trigger?: (eventName: string) => void;
        open?: () => void;
        close?: () => void;
        dataSource?: {
          data: () => Array<{
            Name?: string;
            text?: string;
            Id?: string;
            Value?: string;
            value?: string;
          }>;
        };
      };

      type JqHandle = {
        data: (key: string) => KendoDropdownWidget | undefined;
        getKendoDropDownList?: () => KendoDropdownWidget | undefined;
        getKendoComboBox?: () => KendoDropdownWidget | undefined;
      };

      const resolveWidget = (el: Element): KendoDropdownWidget | null => {
        const w = window as unknown as {
          jQuery?: (node: Element) => JqHandle;
          $?: (node: Element) => JqHandle;
          kendo?: {
            widgetInstance?: (node: Element) => KendoDropdownWidget | undefined;
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

      const readOptions = (input: HTMLElement): OptionRow[] => {
        const widget = resolveWidget(input);
        if (widget?.dataSource?.data) {
          try {
            const rows = widget.dataSource.data() ?? [];
            return rows
              .map((row) => ({
                value: String(row.Id ?? row.Value ?? row.value ?? ''),
                text: String(row.Name ?? row.text ?? ''),
              }))
              .filter((o) => o.text.trim().length > 0);
          } catch {
            /* fall through */
          }
        }
        if (input instanceof HTMLSelectElement) {
          return Array.from(input.options)
            .map((o) => ({ value: o.value, text: o.text }))
            .filter(
              (o) =>
                o.text.trim().length > 0 &&
                !collapse(o.text).includes('select'),
            );
        }
        return [];
      };

      const discoverVisibleInputs = (): HTMLElement[] => {
        const labels = Array.from(document.querySelectorAll('label'));
        const inputs: HTMLElement[] = [];
        for (const lab of labels) {
          if (!isDisplayed(lab)) continue;
          if (!collapse(lab.textContent ?? '').includes(needleLabel)) continue;

          const forId = lab.getAttribute('for')?.trim();
          if (forId) {
            const byFor = document.getElementById(forId);
            if (byFor instanceof HTMLElement) {
              const wrap =
                byFor.closest('.mb-3, .col-12, div') ?? byFor.parentElement;
              if (wrap && isDisplayed(wrap)) {
                inputs.push(byFor);
                continue;
              }
            }
          }

          const wrap = lab.closest('.mb-3, .col-12, div');
          const candidate =
            wrap?.querySelector(
              'input[data-role="dropdownlist"], select, input[type="text"]',
            ) ?? null;
          if (candidate instanceof HTMLElement) {
            const parent = candidate.closest('.mb-3, .col-12, div');
            if (parent && isDisplayed(parent)) {
              inputs.push(candidate);
            }
          }
        }
        return inputs;
      };

      const isUnselectedText = (candidate: string): boolean =>
        a.unselectedLabels.includes(String(candidate ?? '').trim());

      const commitViaListbox = (
        el: HTMLElement,
        displayText: string,
      ): WidgetOpResult => {
        const chromeHost =
          el.closest(a.widgetHostSelector) ??
          el.closest('.k-widget') ??
          null;
        if (!chromeHost) {
          return {
            ok: false,
            reason: `listbox ui: chrome not found for label ${a.labelText}`,
            via: 'chrome-listbox',
          };
        }

        const role = String(el.getAttribute('data-role') ?? '').toLowerCase();
        const chromeEligible =
          el instanceof HTMLInputElement &&
          (role === 'dropdownlist' || role === 'combobox');
        if (!chromeEligible && !(el instanceof HTMLSelectElement)) {
          return {
            ok: false,
            reason: `listbox ui: chrome not eligible for label ${a.labelText}`,
            via: 'chrome-listbox',
          };
        }

        const fieldKey = String(el.id ?? '').trim() || 'bookingField';
        const expanded =
          chromeHost.getAttribute('aria-expanded') === 'true' ||
          chromeHost.classList.contains('k-state-border-down') ||
          chromeHost.classList.contains('k-state-border-up');

        if (!expanded) {
          const selectBtn = chromeHost.querySelector(a.selectSelector);
          if (selectBtn instanceof HTMLElement) {
            selectBtn.click();
          } else if (chromeHost instanceof HTMLElement) {
            chromeHost.click();
          } else {
            const widget = resolveWidget(el);
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
          `${fieldKey}${a.listboxIdSuffix}`;
        const listPopupId = `${fieldKey}${a.listIdSuffix}`;

        let listbox: Element | null =
          document.getElementById(listboxId) ??
          document
            .getElementById(listPopupId)
            ?.querySelector(
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
            reason: `listbox ui: listbox not found (${listboxId}) for label ${a.labelText}`,
            via: 'chrome-listbox',
          };
        }

        const listboxEl = listbox;

        const popupRoot =
          document.getElementById(listPopupId) ??
          listboxEl.closest('.k-list-container, .k-animation-container') ??
          listboxEl.parentElement;

        const filterInput =
          popupRoot?.querySelector(a.filterSelector) ??
          document.querySelector(
            `#${CSS.escape(listPopupId)} ${a.filterSelector}`,
          );

        const findOption = (): HTMLElement | null => {
          const nodes = Array.from(
            listboxEl.querySelectorAll(a.optionSelector),
          );
          const hit = nodes.find(
            (node) => String(node.textContent ?? '').trim() === displayText,
          );
          return hit instanceof HTMLElement ? hit : null;
        };

        let match = findOption();
        if (!match && filterInput instanceof HTMLInputElement) {
          filterInput.focus();
          filterInput.value = '';
          filterInput.dispatchEvent(new Event('input', { bubbles: true }));
          filterInput.value = displayText;
          filterInput.dispatchEvent(new Event('input', { bubbles: true }));
          filterInput.dispatchEvent(
            new KeyboardEvent('keyup', {
              bubbles: true,
              key: displayText.slice(-1) || 'a',
            }),
          );
          match = findOption();
        }

        if (!(match instanceof HTMLElement)) {
          return {
            ok: false,
            reason: `listbox ui: option "${displayText}" not found for label ${a.labelText}`,
            via: 'chrome-listbox',
          };
        }

        match.scrollIntoView({ block: 'nearest' });
        match.click();

        const widget = resolveWidget(el);
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
            (el instanceof HTMLInputElement || el instanceof HTMLSelectElement
              ? el.value
              : '') ??
            '',
        ).trim();

        if (collapse(afterText) !== needleOption || isUnselectedText(afterText)) {
          return {
            ok: false,
            reason: `listbox ui: text mismatch after click for "${displayText}" (got=${afterText || '(empty)'})`,
            via: 'chrome-listbox',
            value: afterVal,
            text: afterText,
            visible: afterText,
          };
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
      };

      const commitViaWidget = (
        el: HTMLElement,
        chosen: OptionRow,
      ): WidgetOpResult => {
        const widget = resolveWidget(el);
        if (!widget) {
          return { ok: false, reason: 'widget api: no kendo widget' };
        }
        try {
          widget.text(chosen.text);
        } catch {
          try {
            widget.value(chosen.value);
          } catch {
            return { ok: false, reason: 'widget api: set failed' };
          }
        }
        if (typeof widget.trigger === 'function') {
          try {
            widget.trigger('change');
          } catch {
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const afterText =
          typeof widget.text === 'function' ? String(widget.text() ?? '') : '';
        if (collapse(afterText) !== needleOption) {
          return {
            ok: false,
            reason: `widget api: text mismatch (got=${afterText || '(empty)'})`,
          };
        }
        return {
          ok: true,
          via: 'kendoDropDownList',
          text: afterText,
          value:
            typeof widget.value === 'function'
              ? String(widget.value() ?? '')
              : chosen.value,
          visible: afterText,
        };
      };

      const inputs = discoverVisibleInputs();
      if (inputs.length === 0) {
        return {
          ok: false,
          reason: `booking dropdown: no visible control for label ${a.labelText}`,
        };
      }

      let sawExactOption = false;
      let lastFail: WidgetOpResult = {
        ok: false,
        reason: `booking dropdown: no exact option for label ${a.labelText}`,
      };

      for (const input of inputs) {
        const options = readOptions(input);
        const matches = options.filter(
          (o) => collapse(o.text) === needleOption,
        );
        if (matches.length > 1) {
          return {
            ok: false,
            reason: `booking dropdown: ambiguous options for label ${a.labelText}`,
          };
        }
        if (matches.length !== 1) continue;
        sawExactOption = true;
        const chosen = matches[0];
        const listboxResult = commitViaListbox(input, chosen.text);
        if (listboxResult.ok) return listboxResult;
        lastFail = listboxResult;
        const widgetResult = commitViaWidget(input, chosen);
        if (widgetResult.ok) return widgetResult;
        lastFail = widgetResult;
      }

      if (!sawExactOption) {
        return {
          ok: false,
          reason: `booking dropdown: no exact option for label ${a.labelText}`,
        };
      }
      return lastFail;
    },
    {
      labelText,
      matchText: intended,
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
