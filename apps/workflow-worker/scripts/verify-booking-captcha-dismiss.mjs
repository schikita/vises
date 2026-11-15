/**
 * Fixture check: booking captcha success = surface dismissed, not `#btnVerified`
 * (REQ-013 / VT-TASK-008).
 *
 * Run: `node scripts/verify-booking-captcha-dismiss.mjs` from apps/workflow-worker
 * (or repo-root path to this file). Uses Patchright + materials fragment.
 */
import { chromium } from 'patchright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const materialsFragment = path.resolve(
  __dirname,
  '../../../site_materials/visa_type/book-appoinntment-captcha.html',
);

const SELECTORS = {
  captchaMainDivId: 'captcha-main-div',
  captchaDivClass: 'captcha-div',
  captchaChallengeRootClass: 'main-div-container',
  captchaVerifyButtonId: 'btnVerify',
};

const isPortalBookingCaptchaSurfaceVisibleInPage = async (page) => {
  return page.evaluate((a) => {
    const isVisiblyPresent = (el) => {
      if (!el) return false;
      let node = el;
      while (node) {
        const style = window.getComputedStyle(node);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0'
        ) {
          return false;
        }
        node = node.parentElement;
      }
      const rect = el.getBoundingClientRect();
      return rect.width >= 1 && rect.height >= 1;
    };

    const rootVisible =
      isVisiblyPresent(document.getElementById(a.captchaMainDivId)) ||
      isVisiblyPresent(document.querySelector(`.${a.captchaDivClass}`)) ||
      isVisiblyPresent(
        document.querySelector(`.${a.captchaChallengeRootClass}`),
      );

    if (!rootVisible) {
      return false;
    }

    return isVisiblyPresent(document.getElementById(a.captchaVerifyButtonId));
  }, SELECTORS);
};

const fragment = fs.readFileSync(materialsFragment, 'utf8');
if (!fragment.includes('id="btnVerify"')) {
  throw new Error('materials fragment missing #btnVerify');
}
if (/id=["']btnVerified["']/.test(fragment)) {
  throw new Error(
    'materials fragment unexpectedly documents #btnVerified — booking success must not require it',
  );
}

const wrappedHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>booking-captcha-dismiss</title>
<style>
  body { margin: 0; }
  .captcha-div, #captcha-main-div, .main-div-container, #btnVerify {
    display: block; width: 120px; height: 40px;
  }
</style>
</head><body>${fragment}</body></html>`;

const tmpDir = path.resolve(__dirname, '../.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const tmpHtml = path.join(tmpDir, 'book-appoinntment-captcha.wrapped.html');
fs.writeFileSync(tmpHtml, wrappedHtml, 'utf8');

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage();
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'domcontentloaded' });

const presentBefore = await isPortalBookingCaptchaSurfaceVisibleInPage(page);
if (!presentBefore) {
  await browser.close();
  throw new Error('expected booking captcha surface visible on materials fixture');
}

const hasBtnVerified = await page.evaluate(
  () => document.getElementById('btnVerified') !== null,
);
if (hasBtnVerified) {
  await browser.close();
  throw new Error('fixture must not rely on #btnVerified for booking success');
}

await page.evaluate(() => {
  for (const el of document.querySelectorAll(
    '#captcha-main-div, .captcha-div, .main-div-container, #btnVerify',
  )) {
    el.remove();
  }
});

const presentAfter = await isPortalBookingCaptchaSurfaceVisibleInPage(page);
await browser.close();

if (presentAfter) {
  throw new Error(
    'expected surface dismissed after remove — dismiss-as-success failed',
  );
}

console.log(
  JSON.stringify({
    ok: true,
    fixture: 'book-appoinntment-captcha.html',
    surfaceVisibleBefore: presentBefore,
    surfaceVisibleAfterDismiss: presentAfter,
    successVia: 'booking_surface_dismiss',
    btnVerifiedRequired: false,
  }),
);
