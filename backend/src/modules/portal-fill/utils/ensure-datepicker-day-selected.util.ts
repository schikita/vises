/// <reference lib="dom" />
import {
  PORTAL_DATEPICKER_CALENDAR_SELECT_SELECTOR,
  PORTAL_DATEPICKER_DATEVIEW_ID_SUFFIX,
  PORTAL_DATEPICKER_SERVER_FIELD_IDS,
  PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
  PORTAL_DATEPICKER_WIDGET_HOST_SELECTOR,
  PORTAL_REGISTER_USER_SELECTORS,
} from '../constants';
import type { PortalFieldName, PortalPage, WidgetOpResult } from '../types';

/**
 * After a datepicker commit, open the dateview and require the intended day
 * cell to carry `k-state-selected` (solid selection), not focus-only outline.
 * Soft-skips when `.k-select` / dateview chrome is absent (fixtures / harness).
 * Re-verifies `widget.value()` + Server* (DEC-014/015).
 */
export const ensureDatepickerDaySelected = async (
  page: PortalPage,
  name: PortalFieldName,
  intendedYmd: string,
): Promise<WidgetOpResult & { skipped?: boolean }> => {
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
    }: {
      selector: string;
      name: string;
      intendedYmd: string;
      staleDefault: string;
      serverFieldIds: readonly string[];
      widgetHostSelector: string;
      selectSelector: string;
      dateviewIdSuffix: string;
    }) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(intendedYmd).trim());
      if (!match) {
        return {
          ok: false,
          reason: `invalid date for selection ensure: ${intendedYmd}`,
          via: 'calendar-selection',
        };
      }
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const ymd = `${match[1]}-${match[2]}-${match[3]}`;
      // Kendo calendar data-value uses 0-based month.
      const dataValueKendo = `${year}/${month - 1}/${day}`;

      const el = document.querySelector(selector) as HTMLInputElement | null;
      if (!el) {
        return {
          ok: false,
          reason: `${selector} not found`,
          via: 'calendar-selection',
        };
      }

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
            reason: `calendar selection: widget.value() missing/invalid (display=${display || '(empty)'})`,
            via: 'calendar-selection',
            value: '',
            visible: display,
          };
        }
        const widgetYmd = formatLocalYmd(read);
        if (widgetYmd === staleDefault) {
          return {
            ok: false,
            reason: `calendar selection: stale default ${staleDefault}`,
            via: 'calendar-selection',
            value: widgetYmd,
            visible: display,
          };
        }
        if (widgetYmd !== ymd) {
          return {
            ok: false,
            reason: `calendar selection: widget.value() mismatch: intended=${ymd} widget=${widgetYmd} display=${display || '(empty)'}`,
            via: 'calendar-selection',
            value: widgetYmd,
            visible: display,
          };
        }
        const sync = syncServerCompanionFromWidgetYmd(widgetYmd);
        if (!sync.ok) {
          return {
            ok: false,
            reason: sync.reason,
            via: 'calendar-selection',
            value: widgetYmd,
            visible: display,
          };
        }
        return {
          ok: true,
          via: 'calendar-selection',
          value: widgetYmd,
          visible: widgetYmd,
        };
      };

      const optionalClose = (widget: KendoDatePickerWidget | null): void => {
        if (!widget || typeof widget.close !== 'function') return;
        try {
          widget.close();
        } catch {
          /* ignore */
        }
      };

      const isDayCellSelected = (cell: Element | null): boolean => {
        if (!cell) return false;
        if (cell.classList.contains('k-state-selected')) return true;
        return cell.getAttribute('aria-selected') === 'true';
      };

      const resolveDayCell = (dateview: Element): HTMLElement | null => {
        const byData = Array.from(
          dateview.querySelectorAll(
            `a.k-link[data-value="${dataValueKendo}"], [data-value="${dataValueKendo}"]`,
          ),
        ).find((node) => {
          const cell =
            node.closest('td[role="gridcell"]') ??
            (node instanceof HTMLTableCellElement ? node : null);
          return cell && !cell.classList.contains('k-other-month');
        });
        if (byData) {
          const cell = byData.closest('td[role="gridcell"]');
          if (cell instanceof HTMLElement) return cell;
          if (byData instanceof HTMLElement) return byData;
        }
        const byText = Array.from(
          dateview.querySelectorAll(
            'td[role="gridcell"]:not(.k-other-month), td.k-state-default:not(.k-other-month)',
          ),
        ).find((node) => {
          const t = String(node.textContent ?? '').trim();
          return t === String(day);
        });
        return byText instanceof HTMLElement ? byText : null;
      };

      const clickDayCell = (cell: HTMLElement): void => {
        const link = cell.querySelector('a.k-link, a, .k-link');
        if (link instanceof HTMLElement) {
          link.click();
          return;
        }
        cell.click();
      };

      const host =
        el.closest(widgetHostSelector) ??
        el.closest('.k-picker-wrap')?.parentElement ??
        null;
      if (!host) {
        return {
          ok: true,
          skipped: true,
          reason: 'calendar selection skipped: datepicker host not found',
          via: 'calendar-selection',
        };
      }

      const selectBtn = host.querySelector(selectSelector);
      if (!(selectBtn instanceof HTMLElement)) {
        return {
          ok: true,
          skipped: true,
          reason: `calendar selection skipped: ${selectSelector} not found`,
          via: 'calendar-selection',
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
          ok: true,
          skipped: true,
          reason: `calendar selection skipped: dateview not found (${dateviewId})`,
          via: 'calendar-selection',
        };
      }

      let cell = resolveDayCell(dateview);
      if (!cell) {
        optionalClose(resolveWidget());
        return {
          ok: false,
          reason: `calendar selection: day cell not found for ${ymd} (${dataValueKendo}) on ${name}`,
          via: 'calendar-selection',
        };
      }

      if (!isDayCellSelected(cell)) {
        clickDayCell(cell);
        cell = resolveDayCell(dateview) ?? cell;
      }

      if (!isDayCellSelected(cell)) {
        optionalClose(resolveWidget());
        return {
          ok: false,
          reason: `calendar selection: day ${ymd} lacks k-state-selected after click on ${name}`,
          via: 'calendar-selection',
        };
      }

      const widget = resolveWidget();
      if (!widget) {
        return {
          ok: false,
          reason: `calendar selection: widget unresolved after day select for ${name}`,
          via: 'calendar-selection',
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
      optionalClose(widget);

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
    },
  );
};
