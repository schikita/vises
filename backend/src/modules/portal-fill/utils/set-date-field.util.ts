/// <reference lib="dom" />
import {
  PORTAL_DATEPICKER_SERVER_FIELD_IDS,
  PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
  PORTAL_REGISTER_USER_SELECTORS,
} from '../constants';
import type { PortalFieldName, PortalPage, WidgetOpResult } from '../types';
import { commitDateViaCalendarUi } from './commit-date-via-calendar-ui.util';

/**
 * Set a portal Kendo/DOM date field from a strict `YYYY-MM-DD` value.
 * Uses local civil Date parts (not `new Date(iso)`) so UTC parsing does not
 * shift the calendar day. Kendo success Requires `widget.value()` civil YMD
 * (OnSubmit mirror); Server* syncs from verified widget YMD only (DEC-014/015).
 * API: value(Date) → retry value(ymdString) + optional close (DEC-016).
 * Calendar UI fallback only when API verify fails (DEC-017).
 */
export const setDateField = async (
  page: PortalPage,
  name: PortalFieldName,
  isoDate: string,
): Promise<WidgetOpResult> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields[name];
  const apiResult = await page.evaluate(
    ({
      selector,
      name,
      isoDate,
      staleDefault,
      serverFieldIds,
    }: {
      selector: string;
      name: string;
      isoDate: string;
      staleDefault: string;
      serverFieldIds: readonly string[];
    }) => {
      const el = document.querySelector(selector) as HTMLInputElement | null;
      if (!el) return { ok: false, reason: `${selector} not found` };

      const raw = String(isoDate).trim();
      const isoPrefix = /^(\d{4}-\d{2}-\d{2})T/.exec(raw);
      const ymdCandidate = isoPrefix ? isoPrefix[1] : raw;
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymdCandidate);
      if (!match) {
        return { ok: false, reason: `invalid date: ${isoDate}` };
      }
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const civil = new Date(year, month - 1, day);
      if (
        civil.getFullYear() !== year ||
        civil.getMonth() !== month - 1 ||
        civil.getDate() !== day
      ) {
        return { ok: false, reason: `invalid date: ${isoDate}` };
      }

      // REQ-006 / CON-001: every production write path uses YYYY-MM-DD (never DD/MM/YYYY).
      const ymd = `${match[1]}-${match[2]}-${match[3]}`;

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

      const notifyWidgetChange = (
        widget: { trigger?: (eventName: string) => void },
        input: HTMLInputElement,
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
        input.blur();
      };

      const optionalClose = (widget: KendoDatePickerWidget): void => {
        if (typeof widget.close !== 'function') return;
        try {
          widget.close();
        } catch {
          /* ignore */
        }
      };

      const readWidgetCivilYmd = (
        widget: KendoDatePickerWidget,
      ): string | null => {
        const read = widget.value();
        if (!(read instanceof Date) || Number.isNaN(read.getTime())) {
          return null;
        }
        return formatLocalYmd(read);
      };

      /** DEC-015: Server* from verified widget YMD only — never intended-alone. */
      const syncServerCompanionFromWidgetYmd = (
        verifiedYmd: string,
      ): { ok: boolean; reason?: string } => {
        const serverId = `Server${name}`;
        if (!serverFieldIds.includes(serverId)) {
          return { ok: true };
        }
        const serverEl = document.getElementById(serverId);
        if (!(serverEl instanceof HTMLInputElement)) {
          return { ok: true };
        }
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

      /** DEC-014 OnSubmit-mirror verify — display/el.value alone is never success. */
      const verifyWidgetAndSyncServer = (
        widget: KendoDatePickerWidget,
        via: string,
      ): {
        ok: boolean;
        reason?: string;
        via: string;
        value: string;
        visible: string;
      } => {
        const display = String(el.value ?? '');
        const widgetYmd = readWidgetCivilYmd(widget);
        if (!widgetYmd) {
          return {
            ok: false,
            reason: `datepicker widget.value() missing/invalid via ${via} (display=${display || '(empty)'})`,
            via,
            value: '',
            visible: display,
          };
        }
        if (widgetYmd === staleDefault) {
          return {
            ok: false,
            reason: `datepicker still shows stale default ${staleDefault}`,
            via,
            value: widgetYmd,
            visible: display,
          };
        }
        if (widgetYmd !== ymd) {
          return {
            ok: false,
            reason: `datepicker widget.value() mismatch: intended=${ymd} widget=${widgetYmd} display=${display || '(empty)'}`,
            via,
            value: widgetYmd,
            visible: display,
          };
        }
        const sync = syncServerCompanionFromWidgetYmd(widgetYmd);
        if (!sync.ok) {
          return {
            ok: false,
            reason: sync.reason,
            via,
            value: widgetYmd,
            visible: display,
          };
        }
        return { ok: true, via, value: widgetYmd, visible: widgetYmd };
      };

      const tryApiCommit = (
        widget: KendoDatePickerWidget,
        valueArg: Date | string,
        via: string,
      ): {
        ok: boolean;
        reason?: string;
        via: string;
        value: string;
        visible: string;
      } => {
        widget.value(valueArg);
        notifyWidgetChange(widget, el);
        optionalClose(widget);
        return verifyWidgetAndSyncServer(widget, via);
      };

      /** DEC-016: value(Date) then value(ymdString); on both fail → calendar hand-off. */
      const commitViaDatePickerApi = (
        widget: KendoDatePickerWidget,
      ): {
        ok: boolean;
        reason?: string;
        via: string;
        value: string;
        visible: string;
      } => {
        const first = tryApiCommit(widget, civil, 'kendoDatePicker');
        if (first.ok) return first;
        const second = tryApiCommit(widget, ymd, 'kendoDatePicker');
        if (second.ok) return second;
        return {
          ok: false,
          via: 'kendoDatePicker-api-unverified',
          reason:
            second.reason ??
            first.reason ??
            'datepicker API commit unverified',
          value: second.value || first.value || '',
          visible: String(el.value ?? ''),
        };
      };

      const failClosedStandIn = (
        committedYmd: string,
        via: string,
      ): {
        ok: boolean;
        reason?: string;
        via: string;
        value: string;
        visible: string;
      } => {
        const norm = String(committedYmd ?? '').slice(0, 10);
        if (!norm) {
          return {
            ok: false,
            reason: `datepicker stand-in read-back empty via ${via}`,
            via,
            value: committedYmd,
            visible: committedYmd,
          };
        }
        if (norm === staleDefault) {
          return {
            ok: false,
            reason: `datepicker still shows stale default ${staleDefault}`,
            via,
            value: committedYmd,
            visible: committedYmd,
          };
        }
        if (norm !== ymd) {
          return {
            ok: false,
            reason: `datepicker stand-in mismatch: intended=${ymd} got=${committedYmd}`,
            via,
            value: committedYmd,
            visible: committedYmd,
          };
        }
        const sync = syncServerCompanionFromWidgetYmd(norm);
        if (!sync.ok) {
          return {
            ok: false,
            reason: sync.reason,
            via,
            value: norm,
            visible: norm,
          };
        }
        return { ok: true, via, value: norm, visible: norm };
      };

      const w = window as unknown as {
        jQuery?: (el: Element) => JqHandle;
        $?: (el: Element) => JqHandle;
        kendo?: {
          widgetInstance?: (el: Element) => KendoDatePickerWidget | undefined;
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

      // DEC-010: jq = jQuery || $; .data → getKendoDatePicker → widgetInstance.
      const jq = w.jQuery ?? w.$;
      if (jq) {
        const jqEl = jq(el);
        const fromData = jqEl.data('kendoDatePicker');
        if (fromData) {
          return commitViaDatePickerApi(fromData);
        }
        if (typeof jqEl.getKendoDatePicker === 'function') {
          const fromGetter = jqEl.getKendoDatePicker();
          if (fromGetter) {
            return commitViaDatePickerApi(fromGetter);
          }
        }
      }

      if (typeof w.kendo?.widgetInstance === 'function') {
        const instance = w.kendo.widgetInstance(el);
        if (instance && typeof instance.value === 'function') {
          return commitViaDatePickerApi(instance);
        }
      }

      if (w.__visesKendoStandIn?.setDatePicker) {
        const set = w.__visesKendoStandIn.setDatePicker(name, ymd);
        if (!set.ok) return set;
        const got = w.__visesKendoStandIn.getDatePicker(name);
        const committed = String(got.value ?? got.visible ?? '');
        const via = set.via ?? 'standin-datepicker';
        return failClosedStandIn(committed, via);
      }

      if (el.getAttribute('data-role') === 'datepicker') {
        // Fixture stand-in without Kendo API: commit via DOM + display marker.
        el.removeAttribute('readonly');
        el.value = ymd;
        el.setAttribute('readonly', 'readonly');
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur();
        const disp = document.querySelector(
          `[data-datepicker-display="${name}"]`,
        );
        if (disp) disp.textContent = ymd;
        const committed = String(disp?.textContent ?? el.value ?? '');
        return failClosedStandIn(committed, 'standin-datepicker');
      }

      // Bare input without datepicker chrome/handler: fail closed (no paint-as-success).
      return {
        ok: false,
        reason: `no Kendo/stand-in datepicker handler for ${name}; refusing display-only input paint`,
      };
    },
    {
      selector,
      name,
      isoDate,
      staleDefault: PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
      serverFieldIds: [...PORTAL_DATEPICKER_SERVER_FIELD_IDS],
    },
  );

  if (apiResult.ok) {
    return apiResult;
  }

  // DEC-017: calendar UI only after API verify failure against a resolvable Kendo path.
  if (apiResult.via === 'kendoDatePicker-api-unverified') {
    const ymdMatch = /^(\d{4}-\d{2}-\d{2})/.exec(String(isoDate).trim());
    const intendedYmd = ymdMatch ? ymdMatch[1] : String(isoDate).trim();
    return commitDateViaCalendarUi(page, name, intendedYmd);
  }

  return apiResult;
};
