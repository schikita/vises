/**
 * DEC-013 / DEC-018 — Patchright harness vs registration.html.
 *
 * Proves PassportType + BirthCountry dropdown commit and DOB / issue / expiry
 * datepicker commit via widget.value() + Server* (OnSubmit mirror).
 * Fails when display matches intended YMD but widget.value() does not.
 *
 * Prerequisites: `npm run build` in backend/ (imports compiled utils).
 *
 * Usage (cwd = backend/):
 *   node scripts/verify-portal-fill-widget-commit.mjs
 *
 * Optional env:
 *   VISES_REGISTRATION_HTML — absolute path to registration.html
 *     (default: ../../test-scrape-app/registration.html relative to backend/)
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { chromium } from 'patchright';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  setDropdownField,
} = require('../dist/modules/portal-fill/utils/set-dropdown-field.util.js');
const {
  setDateField,
} = require('../dist/modules/portal-fill/utils/set-date-field.util.js');

const PASSPORT_TYPE = 'Ordinary Passport';
const BIRTH_COUNTRY = 'Belarus';
const DOB_YMD = '1990-05-15';
const ISSUE_YMD = '2020-01-10';
const EXPIRY_YMD = '2030-12-31';

const defaultHtml = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'test-scrape-app',
  'registration.html',
);
const htmlPath = process.env.VISES_REGISTRATION_HTML
  ? path.resolve(process.env.VISES_REGISTRATION_HTML)
  : defaultHtml;

if (!fs.existsSync(htmlPath)) {
  console.error(`FAIL: registration.html not found at ${htmlPath}`);
  process.exit(1);
}

const injectMinimalKendo = () => {
  const formatLocalYmd = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseYmdToCivilDate = (raw) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw ?? '').trim());
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const civil = new Date(year, month - 1, day);
    if (
      civil.getFullYear() !== year ||
      civil.getMonth() !== month - 1 ||
      civil.getDate() !== day
    ) {
      return null;
    }
    return civil;
  };

  const attachDropdown = (el, options) => {
    let selected = { value: '', text: '' };
    const widget = {
      dataSource: {
        data: () => options,
      },
      value(v) {
        if (v === undefined) return selected.value;
        const match = options.find(
          (o) =>
            String(o.Id) === String(v) ||
            String(o.Value) === String(v) ||
            String(o.Name) === String(v),
        );
        if (match) {
          selected = {
            value: String(match.Id ?? match.Value ?? ''),
            text: String(match.Name ?? ''),
          };
        } else {
          selected = { value: String(v), text: String(v) };
        }
        el.value = selected.value;
        const host = el.closest('.k-widget');
        const kInput = host?.querySelector('.k-input');
        if (kInput) kInput.textContent = selected.text;
        return undefined;
      },
      text(t) {
        if (t === undefined) return selected.text;
        selected.text = String(t);
        return undefined;
      },
      trigger(eventName) {
        el.dispatchEvent(new Event(eventName, { bubbles: true }));
      },
    };
    el.__visesWidgetStore = el.__visesWidgetStore || {};
    el.__visesWidgetStore.kendoDropDownList = widget;
    return widget;
  };

  /**
   * Faithful datepicker: value(Date) and value('YYYY-MM-DD') both update store;
   * optional close() present (DEC-016 / DEC-018).
   */
  const attachDatePicker = (el, options = {}) => {
    const paintOnly = Boolean(options.paintOnly);
    let current = options.initial ?? null;
    const widget = {
      value(d) {
        if (d === undefined) return current;
        if (d instanceof Date) {
          if (!paintOnly) current = d;
          el.value = formatLocalYmd(d);
        } else {
          const parsed = parseYmdToCivilDate(d);
          if (parsed) {
            if (!paintOnly) current = parsed;
            el.value = formatLocalYmd(parsed);
          } else {
            if (!paintOnly) current = null;
            el.value = String(d ?? '');
          }
        }
        return undefined;
      },
      trigger(eventName) {
        el.dispatchEvent(new Event(eventName, { bubbles: true }));
      },
      close() {
        /* no-op; presence proves optional close path */
      },
    };
    el.__visesWidgetStore = el.__visesWidgetStore || {};
    el.__visesWidgetStore.kendoDatePicker = widget;
    return widget;
  };

  // `$`-only probe coverage (DEC-010): expose `$` without `jQuery`.
  const jq = (el) => ({
    data(key) {
      return el?.__visesWidgetStore?.[key];
    },
    getKendoDropDownList() {
      return el?.__visesWidgetStore?.kendoDropDownList;
    },
    getKendoComboBox() {
      return el?.__visesWidgetStore?.kendoComboBox;
    },
    getKendoDatePicker() {
      return el?.__visesWidgetStore?.kendoDatePicker;
    },
  });
  window.$ = jq;
  // Intentionally omit window.jQuery to prove jQuery || $ fallback.

  const passportType = document.querySelector('#PassportType');
  const birthCountry = document.querySelector('#BirthCountry');
  const expiry = document.querySelector('#PassportExpiryDate');
  const dob = document.querySelector('#DateOfBirth');
  const issue = document.querySelector('#PassportIssueDate');

  if (passportType) {
    attachDropdown(passportType, [
      { Id: '1', Name: 'Ordinary Passport' },
      { Id: '2', Name: 'Diplomatic Passport' },
    ]);
  }
  if (birthCountry) {
    attachDropdown(birthCountry, [
      { Id: 'BY', Name: 'Belarus' },
      { Id: 'RU', Name: 'Russia' },
    ]);
  }
  if (dob) attachDatePicker(dob);
  if (issue) attachDatePicker(issue);
  if (expiry) attachDatePicker(expiry);

  return {
    passportTypeReady: Boolean(
      passportType?.__visesWidgetStore?.kendoDropDownList,
    ),
    birthCountryReady: Boolean(
      birthCountry?.__visesWidgetStore?.kendoDropDownList,
    ),
    dobReady: Boolean(dob?.__visesWidgetStore?.kendoDatePicker),
    issueReady: Boolean(issue?.__visesWidgetStore?.kendoDatePicker),
    expiryReady: Boolean(expiry?.__visesWidgetStore?.kendoDatePicker),
  };
};

const assertOk = (label, result) => {
  if (!result?.ok) {
    throw new Error(`${label} failed: ${result?.reason ?? 'unknown'}`);
  }
};

const readDateTruth = async (page, fieldName, serverId) => {
  return page.evaluate(
    ({ fieldName, serverId }) => {
      const formatLocalYmd = (value) => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      const el = document.getElementById(fieldName);
      const display = el instanceof HTMLInputElement ? el.value : '';
      const widget = el?.__visesWidgetStore?.kendoDatePicker;
      const raw = widget && typeof widget.value === 'function' ? widget.value() : null;
      const widgetYmd =
        raw instanceof Date && !Number.isNaN(raw.getTime())
          ? formatLocalYmd(raw)
          : null;
      const serverEl = document.getElementById(serverId);
      const server =
        serverEl instanceof HTMLInputElement ? serverEl.value : null;
      return { display, widgetYmd, server };
    },
    { fieldName, serverId },
  );
};

const assertDateCommitted = async (page, label, fieldName, serverId, intended) => {
  const truth = await readDateTruth(page, fieldName, serverId);
  console.log(`ASSERT ${label}`, {
    intended,
    display: truth.display,
    widgetYmd: truth.widgetYmd,
    server: truth.server,
  });
  if (truth.widgetYmd !== intended) {
    throw new Error(
      `${label}: widget.value() civil mismatch: intended=${intended} widget=${truth.widgetYmd ?? '(null)'} display=${truth.display || '(empty)'}`,
    );
  }
  if (truth.server !== null && truth.server !== intended) {
    throw new Error(
      `${label}: Server* mismatch: intended=${intended} server=${truth.server} widget=${truth.widgetYmd}`,
    );
  }
  // Display may be ISO-ish; require civil prefix match when non-empty.
  const displayNorm = String(truth.display ?? '').slice(0, 10);
  if (displayNorm && displayNorm !== intended && !displayNorm.startsWith(intended)) {
    // Soft note only when widget is correct — still log divergence.
    console.log(`NOTE ${label}: display text differs from widget YMD`, {
      display: truth.display,
      widgetYmd: truth.widgetYmd,
    });
  }
};

const main = async () => {
  console.log(`Harness HTML: ${htmlPath}`);
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#myForm');

    const injected = await page.evaluate(injectMinimalKendo);
    console.log('Injected minimal Kendo-like API:', injected);

    // Case A: API path via `$` (no window.jQuery).
    const passport = await setDropdownField(
      page,
      'PassportType',
      PASSPORT_TYPE,
    );
    assertOk('PassportType', passport);
    if (!String(passport.value ?? '').trim()) {
      throw new Error('PassportType bound value empty (display-only paint?)');
    }
    if (passport.text !== PASSPORT_TYPE) {
      throw new Error(
        `PassportType text mismatch: got ${passport.text ?? '(empty)'}`,
      );
    }
    console.log('PASS PassportType', {
      via: passport.via,
      value: passport.value,
      text: passport.text,
    });

    const birth = await setDropdownField(page, 'BirthCountry', BIRTH_COUNTRY);
    assertOk('BirthCountry', birth);
    if (!String(birth.value ?? '').trim()) {
      throw new Error('BirthCountry bound value empty (display-only paint?)');
    }
    if (birth.text !== BIRTH_COUNTRY) {
      throw new Error(
        `BirthCountry text mismatch: got ${birth.text ?? '(empty)'}`,
      );
    }
    console.log('PASS BirthCountry', {
      via: birth.via,
      value: birth.value,
      text: birth.text,
    });

    const dateCases = [
      {
        name: 'DateOfBirth',
        ymd: DOB_YMD,
        serverId: 'ServerDateOfBirth',
      },
      {
        name: 'PassportIssueDate',
        ymd: ISSUE_YMD,
        serverId: 'ServerPassportIssueDate',
      },
      {
        name: 'PassportExpiryDate',
        ymd: EXPIRY_YMD,
        serverId: 'ServerPassportExpiryDate',
      },
    ];

    for (const { name, ymd, serverId } of dateCases) {
      const result = await setDateField(page, name, ymd);
      assertOk(name, result);
      await assertDateCommitted(page, name, name, serverId, ymd);
      console.log(`PASS ${name}`, {
        via: result.via,
        utilValue: result.value,
        utilVisible: result.visible,
      });
    }

    // Case B: DEC-003 still refuses bare paint when API/store cleared.
    await page.evaluate(() => {
      const el = document.querySelector('#PassportType');
      if (el) {
        delete el.__visesWidgetStore;
        el.value = '';
      }
      window.$ = undefined;
      window.jQuery = undefined;
      window.kendo = undefined;
      window.__visesKendoStandIn = undefined;
    });
    const refuse = await setDropdownField(page, 'PassportType', PASSPORT_TYPE);
    if (refuse.ok) {
      throw new Error(
        'DEC-003 refuse expected after clearing widgets, but ok=true',
      );
    }
    const refuseReason = String(refuse.reason ?? '');
    const refuseOk =
      refuseReason.includes('refusing display-only input paint') ||
      refuseReason.includes('chrome listbox options unavailable');
    if (!refuseOk) {
      throw new Error(
        `DEC-003/011 fail-closed reason unexpected: ${refuseReason || '(empty)'}`,
      );
    }
    console.log('PASS DEC-003/011 bare-paint refuse', {
      reason: refuse.reason,
    });

    // Case C (DEC-018 / SUB-017): paint display without widget store → Must fail.
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#myForm');
    await page.evaluate(() => {
      const formatLocalYmd = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const parseYmdToCivilDate = (raw) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw ?? '').trim());
        if (!m) return null;
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      };
      const attachPaintOnly = (el) => {
        // Stale store (0001-01-01); setter paints el.value only.
        let current = new Date(1, 0, 1);
        const widget = {
          value(d) {
            if (d === undefined) return current;
            if (d instanceof Date) {
              el.value = formatLocalYmd(d);
            } else {
              const parsed = parseYmdToCivilDate(d);
              el.value = parsed ? formatLocalYmd(parsed) : String(d ?? '');
            }
            // Intentionally do NOT update `current` (paint-without-store).
            return undefined;
          },
          trigger(eventName) {
            el.dispatchEvent(new Event(eventName, { bubbles: true }));
          },
          close() {},
        };
        el.__visesWidgetStore = { kendoDatePicker: widget };
      };
      const jq = (node) => ({
        data(key) {
          return node?.__visesWidgetStore?.[key];
        },
        getKendoDatePicker() {
          return node?.__visesWidgetStore?.kendoDatePicker;
        },
      });
      window.$ = jq;
      const expiry = document.querySelector('#PassportExpiryDate');
      if (expiry) attachPaintOnly(expiry);
    });

    const paintOnly = await setDateField(page, 'PassportExpiryDate', EXPIRY_YMD);
    if (paintOnly.ok) {
      throw new Error(
        'Case C: expected failure when display painted but widget.value() stale, but ok=true',
      );
    }
    const paintTruth = await readDateTruth(
      page,
      'PassportExpiryDate',
      'ServerPassportExpiryDate',
    );
    const displayNorm = String(paintTruth.display ?? '').slice(0, 10);
    if (displayNorm === EXPIRY_YMD && paintTruth.widgetYmd === EXPIRY_YMD) {
      throw new Error(
        'Case C: paint-only inject unexpectedly updated widget store',
      );
    }
    if (displayNorm === EXPIRY_YMD && paintTruth.widgetYmd !== EXPIRY_YMD) {
      console.log('PASS Case C display≠widget gate', {
        reason: paintOnly.reason,
        display: paintTruth.display,
        widgetYmd: paintTruth.widgetYmd,
        server: paintTruth.server,
      });
    } else {
      console.log('PASS Case C paint-without-store fail-closed', {
        reason: paintOnly.reason,
        display: paintTruth.display,
        widgetYmd: paintTruth.widgetYmd,
      });
    }

    // Case D: calendar UI fallback — paint-only API + dateview day commit.
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#myForm');
    await page.evaluate(() => {
      const formatLocalYmd = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const parseYmdToCivilDate = (raw) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw ?? '').trim());
        if (!m) return null;
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      };
      const el = document.querySelector('#DateOfBirth');
      if (!el) return;
      let current = new Date(1, 0, 1);
      const widget = {
        value(d) {
          if (d === undefined) return current;
          if (d instanceof Date) {
            // Calendar day handler will call this to truly commit.
            current = d;
            el.value = formatLocalYmd(d);
          } else {
            // API string/Date path from setDateField: paint only (force API fail).
            const parsed = parseYmdToCivilDate(d);
            el.value = parsed ? formatLocalYmd(parsed) : String(d ?? '');
          }
          return undefined;
        },
        trigger(eventName) {
          el.dispatchEvent(new Event(eventName, { bubbles: true }));
        },
        close() {},
      };
      // Override: Date object from API also paints only (string path already does).
      widget.value = (d) => {
        if (d === undefined) return current;
        if (d instanceof Date) {
          // Distinguish calendar commit via flag on the Date object is fragile;
          // use call-site: calendar cells call commitFromCalendar.
          if (d.__visesFromCalendar) {
            current = d;
            el.value = formatLocalYmd(d);
          } else {
            el.value = formatLocalYmd(d);
          }
          return undefined;
        }
        const parsed = parseYmdToCivilDate(d);
        el.value = parsed ? formatLocalYmd(parsed) : String(d ?? '');
        return undefined;
      };
      widget.commitFromCalendar = (civil) => {
        current = civil;
        el.value = formatLocalYmd(civil);
      };

      el.__visesWidgetStore = { kendoDatePicker: widget };
      const jq = (node) => ({
        data(key) {
          return node?.__visesWidgetStore?.[key];
        },
        getKendoDatePicker() {
          return node?.__visesWidgetStore?.kendoDatePicker;
        },
      });
      window.$ = jq;

      const host = el.closest('.k-widget') || el.parentElement;
      const dateviewId =
        el.getAttribute('aria-owns')?.trim() || 'DateOfBirth_dateview';
      let dateview = document.getElementById(dateviewId);
      if (!dateview) {
        dateview = document.createElement('div');
        dateview.id = dateviewId;
        dateview.className = 'k-calendar';
        document.body.appendChild(dateview);
      }
      dateview.innerHTML = '';
      dateview.style.display = 'none';
      const td = document.createElement('td');
      td.setAttribute('role', 'gridcell');
      td.className = 'k-state-default';
      td.dataset.value = '1990/4/15';
      const a = document.createElement('a');
      a.className = 'k-link';
      a.textContent = '15';
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const civil = new Date(1990, 4, 15);
        civil.__visesFromCalendar = true;
        widget.value(civil);
        widget.trigger('change');
        dateview.style.display = 'none';
      });
      td.appendChild(a);
      dateview.appendChild(td);
      const selectBtn = host?.querySelector('.k-select');
      if (selectBtn) {
        selectBtn.addEventListener('click', () => {
          dateview.style.display = 'block';
        });
      }
    });

    const calendarResult = await setDateField(page, 'DateOfBirth', DOB_YMD);
    assertOk('DateOfBirth calendar fallback', calendarResult);
    if (calendarResult.via !== 'calendar-ui') {
      throw new Error(
        `Case D: expected via=calendar-ui, got ${calendarResult.via ?? '(empty)'}`,
      );
    }
    await assertDateCommitted(
      page,
      'DateOfBirth (calendar)',
      'DateOfBirth',
      'ServerDateOfBirth',
      DOB_YMD,
    );
    console.log('PASS Case D calendar UI fallback', {
      via: calendarResult.via,
      value: calendarResult.value,
    });

    console.log('HARNESS PASS');
  } finally {
    await browser.close();
  }
};

main().catch((err) => {
  console.error('HARNESS FAIL', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
