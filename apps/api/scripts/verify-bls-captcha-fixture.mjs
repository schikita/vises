/**
 * DOM verification against fixtures/bls-captcha.sample.html
 * (derived from operator sample capcha.html).
 *
 * Checks: 9 topmost grid cells, TaskArgument 830, #submit present.
 */
import { chromium } from 'patchright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const fixture = path.resolve(
  'src/modules/portal-scrape/fixtures/bls-captcha.sample.html',
);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage();
await page.goto(pathToFileURL(fixture).href, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.main-div-container');

const result = await page.evaluate(() => {
  const isDisplayed = (el) => {
    let node = el;
    while (node) {
      const s = getComputedStyle(node);
      if (
        s.display === 'none' ||
        s.visibility === 'hidden' ||
        s.opacity === '0'
      ) {
        return false;
      }
      node = node.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width >= 8 && r.height >= 8;
  };

  const visible = Array.from(
    document.querySelectorAll('.main-div-container img.captcha-img'),
  ).filter((el) => el instanceof HTMLImageElement && isDisplayed(el));

  const slots = new Map();
  for (const img of visible) {
    const r = img.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const topImg = document
      .elementsFromPoint(cx, cy)
      .find(
        (el) =>
          el instanceof HTMLImageElement &&
          el.classList.contains('captcha-img'),
      );
    if (topImg !== img) continue;
    const key =
      String(Math.round(r.left / 30) * 30) +
      ',' +
      String(Math.round(r.top / 30) * 30);
    slots.set(key, img);
  }

  const chosen = [...slots.values()].sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return Math.abs(ra.top - rb.top) > 40 ? ra.top - rb.top : ra.left - rb.left;
  });

  const labels = Array.from(document.querySelectorAll('.box-label')).filter(
    (el) => {
      if (!isDisplayed(el)) return false;
      if (getComputedStyle(el).color === 'rgb(240, 248, 255)') return false;
      return true;
    },
  );
  const text = (labels[0]?.textContent || '').trim();
  const m = /Please select all boxes with number\s+(\d+)/i.exec(text);

  const imagesBase64 = chosen.map((img) => {
    const src = img.currentSrc || img.src || '';
    const marker = ';base64,';
    const idx = src.indexOf(marker);
    return idx >= 0 ? src.slice(idx + marker.length) : '';
  });

  // Prefer portal Select() when present (fixture may lack jQuery from CDN).
  const answer = [true, true, false, false, false, false, false, false, false];
  let selectCallable = typeof window.Select === 'function';
  if (!selectCallable) {
    window.selection = [];
    window.Select = function Select(id, img) {
      if (window.selection.indexOf(id) > -1) return;
      window.selection.push(id);
      img.classList.add('img-selected');
    };
    selectCallable = true;
  }
  for (let i = 0; i < answer.length; i += 1) {
    if (!answer[i]) continue;
    const img = chosen[i];
    const id = img.parentElement?.id;
    window.Select(id, img);
  }
  const selectedCount = document.querySelectorAll(
    'img.captcha-img.img-selected',
  ).length;
  const submit = document.querySelector('#submit');
  const actionDiv = submit?.closest('.img-action-div');
  const onSubmitCallable = typeof window.onSubmit === 'function';

  return {
    allCaptchaImg: document.querySelectorAll('img.captcha-img').length,
    slotCount: slots.size,
    taskArgument: m?.[1] ?? null,
    imageLens: imagesBase64.map((s) => s.length),
    allImagesNonEmpty: imagesBase64.every((s) => s.length > 100),
    selectedCount,
    selectCallable,
    onSubmitCallable,
    submitExists: Boolean(submit),
    actionDivExists: Boolean(actionDiv),
    cellIds: chosen.map((img) => img.parentElement?.id ?? null),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();

const ok =
  result.slotCount === 9 &&
  result.taskArgument === '830' &&
  result.allImagesNonEmpty === true &&
  result.selectedCount === 2 &&
  result.selectCallable === true &&
  result.submitExists === true &&
  result.actionDivExists === true;

if (!ok) {
  console.error('VERIFY FAIL');
  process.exit(1);
}
console.log('VERIFY PASS');
