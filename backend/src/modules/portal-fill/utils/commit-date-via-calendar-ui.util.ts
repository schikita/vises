/// <reference lib="dom" />
import {
  PORTAL_DATEPICKER_CALENDAR_NAV_MAX_STEPS,
  PORTAL_DATEPICKER_CALENDAR_SELECT_SELECTOR,
  PORTAL_DATEPICKER_DATEVIEW_DAY_CELL_SELECTOR,
  PORTAL_DATEPICKER_DATEVIEW_ID_SUFFIX,
  PORTAL_DATEPICKER_DATEVIEW_NAV_FAST_SELECTOR,
  PORTAL_DATEPICKER_DATEVIEW_NAV_NEXT_SELECTOR,
  PORTAL_DATEPICKER_DATEVIEW_NAV_PREV_SELECTOR,
  PORTAL_DATEPICKER_DATEVIEW_PERIOD_CELL_SELECTOR,
  PORTAL_DATEPICKER_SERVER_FIELD_IDS,
  PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
  PORTAL_DATEPICKER_WIDGET_HOST_SELECTOR,
  PORTAL_REGISTER_USER_SELECTORS,
} from '../constants';
import type { PortalFieldName, PortalPage, WidgetOpResult } from '../types';

/**
 * Calendar UI fallback for RegisterUser datepickers (DEC-017 / REQ-014).
 * Invoked only when Kendo API commit fails verification.
 * Click `.k-select` → navigate dateview year → month → day → re-verify
 * `widget.value()` + Server* (DEC-014/015). Preserves civil YYYY-MM-DD (CON-008).
 */
export const commitDateViaCalendarUi = async (
  page: PortalPage,
  name: PortalFieldName,
  intendedYmd: string,
): Promise<WidgetOpResult> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields[name];
  return page.evaluate(
    ({
      selector,
      name,
      intendedYmd,
      staleDefault,
      serverFieldIds,
      widgetHostSelector,
      selectSelector,
      dateviewIdSuffix,
      navFastSelector,
      navPrevSelector,
      navNextSelector,
      periodCellSelector,
      dayCellSelector,
      navMaxSteps,
    }: {
      selector: string;
      name: string;
      intendedYmd: string;
      staleDefault: string;
      serverFieldIds: readonly string[];
      widgetHostSelector: string;
      selectSelector: string;
      dateviewIdSuffix: string;
      navFastSelector: string;
      navPrevSelector: string;
      navNextSelector: string;
      periodCellSelector: string;
      dayCellSelector: string;
      navMaxSteps: number;
    }) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(intendedYmd).trim());
      if (!match) {
        return { ok: false, reason: `invalid date for calendar: ${intendedYmd}` };
      }
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const ymd = `${match[1]}-${match[2]}-${match[3]}`;

      const el = document.querySelector(selector) as HTMLInputElement | null;
      if (!el) return { ok: false, reason: `${selector} not found` };

      type KendoDatePickerWidget = {
        value: (d?: Date | string) => Date | null | void;
        trigger?: (eventName: string) => void;
        close?: () => void;
      };

      type JqHandle = {
        data: (key: string) => KendoDatePickerWidget | undefined;
        getKendoDatePicker?: () => KendoDatePickerWidget | undefined;
      };

      const formatLocalYmd = (value: Date): string => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const resolveWidget = (): KendoDatePickerWidget | null => {
        const w = window as unknown as {
          jQuery?: (el: Element) => JqHandle;
          $?: (el: Element) => JqHandle;
          kendo?: {
            widgetInstance?: (el: Element) => KendoDatePickerWidget | undefined;
          };
        };
        const jq = w.jQuery ?? w.$;
        if (jq) {
          const jqEl = jq(el);
          const fromData = jqEl.data('kendoDatePicker');
          if (fromData) return fromData;
          if (typeof jqEl.getKendoDatePicker === 'function') {
            const fromGetter = jqEl.getKendoDatePicker();
            if (fromGetter) return fromGetter;
          }
        }
        if (typeof w.kendo?.widgetInstance === 'function') {
          const instance = w.kendo.widgetInstance(el);
          if (instance && typeof instance.value === 'function') return instance;
        }
        return null;
      };

      const syncServerCompanionFromWidgetYmd = (
        verifiedYmd: string,
      ): { ok: boolean; reason?: string } => {
        const serverId = `Server${name}`;
        if (!serverFieldIds.includes(serverId)) return { ok: true };
        const serverEl = document.getElementById(serverId);
        if (!(serverEl instanceof HTMLInputElement)) return { ok: true };
        serverEl.value = verifiedYmd;
        serverEl.dispatchEvent(new Event('change', { bubbles: true }));
        if (serverEl.value !== verifiedYmd) {
          return {
            ok: false,
            reason: `Server* sync failed: ${serverId}=${serverEl.value} expected=${verifiedYmd}`,
          };
        }
        return { ok: true };
      };

      const verifyWidgetAndSyncServer = (
        widget: KendoDatePickerWidget,
      ): WidgetOpResult => {
        const display = String(el.value ?? '');
        const read = widget.value();
        if (!(read instanceof Date) || Number.isNaN(read.getTime())) {
          return {
            ok: false,
            reason: `calendar fallback: widget.value() missing/invalid (display=${display || '(empty)'})`,
            via: 'calendar-ui',
            value: '',
            visible: display,
          };
        }
        const widgetYmd = formatLocalYmd(read);
        if (widgetYmd === staleDefault) {
          return {
            ok: false,
            reason: `calendar fallback: stale default ${staleDefault}`,
            via: 'calendar-ui',
            value: widgetYmd,
            visible: display,
          };
        }
        if (widgetYmd !== ymd) {
          return {
            ok: false,
            reason: `calendar fallback: widget.value() mismatch: intended=${ymd} widget=${widgetYmd} display=${display || '(empty)'}`,
            via: 'calendar-ui',
            value: widgetYmd,
            visible: display,
          };
        }
        const sync = syncServerCompanionFromWidgetYmd(widgetYmd);
        if (!sync.ok) {
          return {
            ok: false,
            reason: sync.reason,
            via: 'calendar-ui',
            value: widgetYmd,
            visible: display,
          };
        }
        return {
          ok: true,
          via: 'calendar-ui',
          value: widgetYmd,
          visible: widgetYmd,
        };
      };

      const host =
        el.closest(widgetHostSelector) ??
        el.closest('.k-picker-wrap')?.parentElement ??
        null;
      if (!host) {
        return {
          ok: false,
          reason: `calendar fallback: datepicker host not found for ${name}`,
          via: 'calendar-ui',
        };
      }

      const selectBtn = host.querySelector(selectSelector);
      if (!(selectBtn instanceof HTMLElement)) {
        return {
          ok: false,
          reason: `calendar fallback: ${selectSelector} not found for ${name}`,
          via: 'calendar-ui',
        };
      }
      selectBtn.click();

      const dateviewId =
        el.getAttribute('aria-owns')?.trim() ||
        host.getAttribute('aria-owns')?.trim() ||
        `${name}${dateviewIdSuffix}`;
      let dateview = document.getElementById(dateviewId);
      if (!dateview) {
        dateview = document.querySelector(
          `#${CSS.escape(dateviewId)}, .k-animation-container .k-calendar, .k-calendar`,
        ) as HTMLElement | null;
      }
      if (!dateview) {
        return {
          ok: false,
          reason: `calendar fallback: dateview not found (${dateviewId}) for ${name}`,
          via: 'calendar-ui',
        };
      }

      const clickFirstMatching = (
        root: Element,
        sel: string,
        predicate: (node: Element) => boolean,
      ): boolean => {
        const nodes = Array.from(root.querySelectorAll(sel));
        const hit = nodes.find(predicate);
        if (hit instanceof HTMLElement) {
          hit.click();
          return true;
        }
        const link = hit?.querySelector?.('a, .k-link');
        if (link instanceof HTMLElement) {
          link.click();
          return true;
        }
        return false;
      };

      const monthNames = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
      ];
      const monthShort = monthNames.map((m) => m.slice(0, 3));

      // Climb toward decade/year view via title clicks, then pick year → month → day.
      for (let i = 0; i < 3; i += 1) {
        const title = dateview.querySelector(navFastSelector);
        if (title instanceof HTMLElement) title.click();
      }

      const yearClicked = (() => {
        for (let step = 0; step < navMaxSteps; step += 1) {
          const found = clickFirstMatching(
            dateview,
            periodCellSelector,
            (node) => {
              const t = String(node.textContent ?? '').trim();
              return t === String(year) || t.includes(String(year));
            },
          );
          if (found) return true;
          const next = dateview.querySelector(navNextSelector);
          const prev = dateview.querySelector(navPrevSelector);
          if (year < new Date().getFullYear()) {
            if (prev instanceof HTMLElement) prev.click();
            else if (next instanceof HTMLElement) next.click();
            else break;
          } else if (next instanceof HTMLElement) {
            next.click();
          } else if (prev instanceof HTMLElement) {
            prev.click();
          } else {
            break;
          }
        }
        return false;
      })();

      if (!yearClicked) {
        // Harness / simplified dateview: may already be on month grid with data-value cells.
        const dataValueKendo = `${year}/${month - 1}/${day}`;
        const dataValueIso = ymd;
        const dayByData = Array.from(
          dateview.querySelectorAll(
            `td[data-value="${dataValueKendo}"], td[data-value="${dataValueIso}"], [data-value="${dataValueKendo}"], [data-value="${dataValueIso}"]`,
          ),
        ).find((n) => !n.classList.contains('k-other-month'));
        if (dayByData instanceof HTMLElement) {
          const link = dayByData.querySelector('a, .k-link');
          if (link instanceof HTMLElement) link.click();
          else dayByData.click();
        } else {
          return {
            ok: false,
            reason: `calendar fallback: year ${year} cell not found for ${name}`,
            via: 'calendar-ui',
          };
        }
      } else {
        const monthLabel = monthNames[month - 1];
        const monthLabelShort = monthShort[month - 1];
        const monthClicked = clickFirstMatching(
          dateview,
          periodCellSelector,
          (node) => {
            const t = String(node.textContent ?? '').trim().toLowerCase();
            return (
              t === monthLabel ||
              t === monthLabelShort ||
              t === String(month) ||
              t === String(month).padStart(2, '0')
            );
          },
        );
        if (!monthClicked) {
          // Some views jump straight to month grid after year.
        }

        const dataValueKendo = `${year}/${month - 1}/${day}`;
        let dayClicked = clickFirstMatching(
          dateview,
          `td[data-value="${dataValueKendo}"], [data-value="${dataValueKendo}"]`,
          (node) => !node.classList.contains('k-other-month'),
        );
        if (!dayClicked) {
          dayClicked = clickFirstMatching(
            dateview,
            dayCellSelector,
            (node) => {
              if (node.classList.contains('k-other-month')) return false;
              const t = String(node.textContent ?? '').trim();
              return t === String(day);
            },
          );
        }
        if (!dayClicked) {
          return {
            ok: false,
            reason: `calendar fallback: day ${day} cell not found for ${name}`,
            via: 'calendar-ui',
          };
        }
      }

      const widget = resolveWidget();
      if (!widget) {
        return {
          ok: false,
          reason: `calendar fallback: widget unresolved after day click for ${name}`,
          via: 'calendar-ui',
        };
      }

      if (typeof widget.trigger === 'function') {
        try {
          widget.trigger('change');
        } catch {
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.blur();
        }
      } else {
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur();
      }
      if (typeof widget.close === 'function') {
        try {
          widget.close();
        } catch {
          /* ignore */
        }
      }

      return verifyWidgetAndSyncServer(widget);
    },
    {
      selector,
      name,
      intendedYmd,
      staleDefault: PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
      serverFieldIds: [...PORTAL_DATEPICKER_SERVER_FIELD_IDS],
      widgetHostSelector: PORTAL_DATEPICKER_WIDGET_HOST_SELECTOR,
      selectSelector: PORTAL_DATEPICKER_CALENDAR_SELECT_SELECTOR,
      dateviewIdSuffix: PORTAL_DATEPICKER_DATEVIEW_ID_SUFFIX,
      navFastSelector: PORTAL_DATEPICKER_DATEVIEW_NAV_FAST_SELECTOR,
      navPrevSelector: PORTAL_DATEPICKER_DATEVIEW_NAV_PREV_SELECTOR,
      navNextSelector: PORTAL_DATEPICKER_DATEVIEW_NAV_NEXT_SELECTOR,
      periodCellSelector: PORTAL_DATEPICKER_DATEVIEW_PERIOD_CELL_SELECTOR,
      dayCellSelector: PORTAL_DATEPICKER_DATEVIEW_DAY_CELL_SELECTOR,
      navMaxSteps: PORTAL_DATEPICKER_CALENDAR_NAV_MAX_STEPS,
    },
  );
};
