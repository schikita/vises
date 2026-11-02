// Browserless BLS LOGIN → STATUS → BOOK(safe-stop) flow — VS-2538
// Pure HTTP (axios) + local NN captcha solver backend (127.0.0.1:8788).
//
// Usage: node flow-login-status-book.mjs
// Env: MAIL_LOCAL, PORTAL_PASSWORD, PACING_MS

import axios from 'file:///E:/my/vises/node_modules/axios/lib/axios.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BASE = 'https://appointment.blsspainbelarus.by';
const SOLVER = 'http://127.0.0.1:8788';
const EVIDENCE_DIR = path.resolve('evidence-login');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MAIL_LOCAL = process.env.MAIL_LOCAL || 'vises944a1f91068c';
const MAIL_DOMAIN = 'fexpost.com';
// Portal password comes strictly from the PORTAL_PASSWORD env var (never commit real secrets).
const PORTAL_PASSWORD = process.env.PORTAL_PASSWORD || '';

const PACING_MS = Number(process.env.PACING_MS || 8000);
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- cookie jar ----------------
class CookieJar {
  constructor() {
    this.jar = new Map();
  }
  absorb(setCookies) {
    for (const sc of setCookies || []) {
      const [pair] = sc.split(';');
      const eq = pair.indexOf('=');
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (value === '' && name.startsWith('.')) continue;
      this.jar.set(name, value);
    }
  }
  header() {
    return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
  set(name, value) {
    this.jar.set(name, value);
  }
}
const jar = new CookieJar();
jar.set('visitorId', crypto.randomBytes(16).toString('hex'));

// ---------------- http ----------------
let requestSeq = 0;
async function req(method, url, { data, headers = {}, referer, maxRetries = 3, follow = true } = {}) {
  const fullUrl = url.startsWith('http') ? url : BASE + url;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await sleep(PACING_MS + Math.random() * 2000);
    const cookieHeader = jar.header();
    const hdrs = {
      'User-Agent': UA,
      'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
      ...(referer ? { Referer: referer } : {}),
      ...headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };
    try {
      const res = await axios.request({
        method,
        url: fullUrl,
        data,
        headers: hdrs,
        timeout: 90000,
        maxRedirects: 0,
        validateStatus: () => true,
      });
      jar.absorb(res.headers['set-cookie']);
      const seq = ++requestSeq;
      const file = path.join(EVIDENCE_DIR, `${String(seq).padStart(2, '0')}-${method.toLowerCase()}-${new URL(fullUrl).pathname.replaceAll('/', '_').slice(0, 55)}.txt`);
      const bodyText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      const setCookies = (res.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('\n');
      fs.writeFileSync(file, `>> ${method} ${fullUrl}\n>> status ${res.status}\n>> location ${res.headers.location || '-'}\n>> cookie-sent: ${cookieHeader}\n>> set-cookie: ${setCookies}\n\n${bodyText}`);
      log(`${method} ${new URL(fullUrl).pathname.slice(0, 50)} -> ${res.status} (${bodyText.length}b)${res.headers.location ? ' loc=' + res.headers.location.slice(0, 60) : ''}`);
      if (res.status === 429) {
        const waitMs = 120000 * attempt;
        log(`  429 rate-limited, waiting ${waitMs / 1000}s (attempt ${attempt}/${maxRetries})`);
        await sleep(waitMs);
        continue;
      }
      if (follow && [301, 302, 303, 307].includes(res.status) && res.headers.location) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location;
        return req('GET', next, { headers, referer: fullUrl });
      }
      return { status: res.status, text: bodyText, headers: res.headers, url: fullUrl };
    } catch (e) {
      log(`  network error: ${e.message} (attempt ${attempt}/${maxRetries})`);
      if (attempt === maxRetries) throw e;
      await sleep(20000 * attempt);
    }
  }
  throw new Error('rate limited after retries');
}

const postForm = (url, fields, referer, xhr = false) =>
  req('POST', url, {
    data: new URLSearchParams(fields).toString(),
    referer,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: BASE,
      ...(xhr ? { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json, text/javascript, */*; q=0.01' } : {}),
    },
  });

// ---------------- html helpers ----------------
const decodeEntities = (s) =>
  String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? decodeEntities(m[1]) : null;
};

// CSS cascade (static) — same approach as extract.js / verified on live pages.
function buildRuleMap(html) {
  const ruleMap = new Map();
  for (const sm of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const rm of sm[1].matchAll(/\.([a-z0-9]+)\s*\{([^}]*)\}/gi)) {
      if (!ruleMap.has(rm[1])) ruleMap.set(rm[1], []);
      ruleMap.get(rm[1]).push(rm[2]);
    }
  }
  return ruleMap;
}
const computed = (ruleMap, classes) => {
  const out = {};
  for (const c of classes) {
    for (const d of ruleMap.get(c) || []) {
      for (const decl of d.split(';')) {
        const m = decl.match(/^\s*([a-z-]+)\s*:\s*([^;]+?)\s*$/);
        if (m) out[m[1]] = m[2];
      }
    }
  }
  return out;
};
const isHidden = (c) => (c.display || '').replace(/\s*!important/, '') === 'none' || c.visibility === 'hidden';

/**
 * Decoy-field discovery (login email/password steps), whole-page scan:
 * <div class="mb-3 position-relative <random>"><label for="X">Email*</label><input ... id="X">
 * The REAL field's wrapper has display != none in the static cascade
 * (verified: real=block !important, decoys=none !important — JS noise can't override !important).
 * NOTE: password inputs may render OUTSIDE the form (seen on live re-render) — hence whole-page.
 */
function findRealFieldInputs(html, _formActionSubstring, inputType) {
  const ruleMap = buildRuleMap(html);
  const result = [];
  for (const wm of html.matchAll(
    new RegExp(`<div[^>]*class="(mb-3 position-relative[^"]*)"[^>]*>\\s*<label[^>]*for="([a-z0-9]+)"[^>]*>[\\s\\S]*?</label>\\s*<input[^>]*type\\s*=\\s*"${inputType}"[^>]*>`, 'gi'),
  )) {
    const c = computed(ruleMap, wm[1].split(/\s+/));
    const inputTag = wm[0].match(/<input[^>]*>/i)?.[0] || '';
    result.push({
      id: attr(inputTag, 'id'),
      name: attr(inputTag, 'name'),
      hidden: isHidden(c),
      display: c.display || null,
    });
  }
  const visible = result.filter((r) => !r.hidden);
  return { all: result, real: visible.length === 1 ? visible[0] : null };
}

// ---------------- captcha widget parser (static, extract.js port) ----------------
function parseCaptcha(html) {
  const ruleMap = buildRuleMap(html);
  const px = (v) => parseFloat(v) || 0;

  const tiles = [];
  for (const wm of html.matchAll(
    /<div\s+class="(col-4[^"]*)"\s+style="([^"]*)"\s+id="([^"]*)"[^>]*>\s*<img[^>]*class="captcha-img"[^>]*src="([^"]*)"/gi,
  )) {
    const c = computed(ruleMap, wm[1].split(/\s+/));
    const src = decodeEntities(wm[4]);
    const m = src.match(/^data:image\/[a-z+]+;base64,(.*)$/i);
    if (!m) continue;
    tiles.push({
      id: wm[3],
      hidden: (c.display || '').replace(/\s*!important/, '') === 'none' || c.visibility === 'hidden',
      z: c['z-index'] === undefined || c['z-index'] === 'auto' ? 0 : parseInt(c['z-index']),
      left: px(c.left),
      top: px(c.top),
      b64: m[1],
    });
  }

  const labels = [];
  for (const lm of html.matchAll(
    /<div\s+class='([^']*)'\s+id='([^']*)'[^>]*>\s*Please select all boxes with number (\d+)\s*<\/div>/gi,
  )) {
    const c = computed(ruleMap, lm[1].split(/\s+/));
    labels.push({
      id: lm[2],
      target: lm[3],
      hidden: (c.display || '').replace(/\s*!important/, '') === 'none' || c.visibility === 'hidden',
      z: c['z-index'] === undefined || c['z-index'] === 'auto' ? 0 : parseInt(c['z-index']),
    });
  }

  const cells = new Map();
  for (const t of tiles) {
    if (t.hidden) continue;
    const key = `${Math.round(t.left / 110)}_${Math.round(t.top / 110)}`;
    const prev = cells.get(key);
    if (!prev || t.z >= prev.z) cells.set(key, t);
  }
  let instr = null;
  for (const l of labels) {
    if (!l.hidden && (!instr || l.z > instr.z)) instr = l;
  }
  return { tiles, labels, cells, instr };
}

async function solveCaptcha(html, referer) {
  const { cells, instr } = parseCaptcha(html);
  log(`  captcha: cells=${cells.size} target=${instr && instr.target}`);
  if (cells.size !== 9 || !instr) throw new Error('captcha parse failed');
  const grid = [...cells.values()].sort((a, b) => a.top - b.top || a.left - b.left);
  const solveRes = await axios.post(`${SOLVER}/solve`, {
    target: instr.target,
    tiles: grid.map((t) => ({ id: t.id, b64: t.b64 })),
  }, { timeout: 120000 });
  const { picks, tiles: perTile } = solveRes.data;
  log('  solver:', JSON.stringify(perTile.map((t) => `${t.num}(${t.conf})`)), '-> picks', JSON.stringify(picks));
  if (!solveRes.data.ok || picks.length === 0) throw new Error('solver found no picks');
  return picks;
}

function parseFormHiddens(html, actionSubstring) {
  const formMatch = html.match(new RegExp(`<form[^>]*action="[^"]*${actionSubstring}[^"]*"[\\s\\S]*?</form>`, 'i'));
  if (!formMatch) return null;
  const form = formMatch[0];
  const hiddens = {};
  for (const im of form.matchAll(/<input([^>]*type="hidden"[^>]*)>/gi)) {
    const tag = im[1];
    const name = attr(tag, 'name');
    if (name) hiddens[name] = attr(tag, 'value') ?? '';
  }
  return { form, hiddens };
}

// ---------------- tempmail ----------------
const mailListUrl = () => `https://tempmail.plus/api/mails?email=${encodeURIComponent(`${MAIL_LOCAL}@${MAIL_DOMAIN}`)}&limit=20&epin=`;
const mailDetailUrl = (mailId) => `https://tempmail.plus/api/mails/${mailId}?email=${encodeURIComponent(`${MAIL_LOCAL}@${MAIL_DOMAIN}`)}&epin=`;

async function fetchMailList() {
  const res = await axios.get(mailListUrl(), { headers: { 'User-Agent': UA }, timeout: 30000 });
  return res.data;
}
async function fetchMailBody(mailId) {
  const res = await axios.get(mailDetailUrl(mailId), { headers: { 'User-Agent': UA }, timeout: 30000 });
  return res.data;
}

// ---------------- flow ----------------
async function main() {
  // ===== LOGIN step 1: email =====
  const loginPage = await req('GET', '/Global/account/login', { headers: { Accept: 'text/html,...' } });
  const emailForm = findRealFieldInputs(loginPage.text, 'LoginSubmit', 'text');
  if (!emailForm?.real) throw new Error('real email input not found on login page');
  log(`login email field: ${emailForm.real.id} (${emailForm.all.length} fields, ${emailForm.all.length - 1} decoys)`);
  const emailHiddens = parseFormHiddens(loginPage.text, 'LoginSubmit').hiddens;

  const emailBody = [];
  const submittedData = {};
  for (const f of emailForm.all) {
    const val = f.id === emailForm.real.id ? `${MAIL_LOCAL}@${MAIL_DOMAIN}` : '';
    emailBody.push([f.name, val]);
    submittedData[f.id] = val; // site's OnSubmitVerify packs ALL fields into ResponseData JSON
  }
  for (const [k, v] of Object.entries(emailHiddens)) emailBody.push([k, v]);
  const rdIdx = emailBody.findIndex(([k]) => k === 'ResponseData');
  if (rdIdx >= 0) emailBody[rdIdx][1] = JSON.stringify(submittedData);

  // ===== LOGIN step 2: captcha page =====
  const captchaPage = await postForm('/Global/account/LoginSubmit', emailBody, `${BASE}/Global/account/login`);
  const capForm = parseFormHiddens(captchaPage.text, 'LoginCaptchaSubmit');
  if (!capForm) throw new Error(`captcha form not found after email submit (url=${captchaPage.url})`);
  log(`on captcha page: ${new URL(captchaPage.url).pathname}`);
  const picks1 = await solveCaptcha(captchaPage.text, captchaPage.url);

  const capBody = [
    ['SelectedImages', picks1.join(',')],
    ...Object.entries(capForm.hiddens),
  ];
  // ===== LOGIN step 3: password page =====
  const pwPage = await postForm('/Global/NewCaptcha/LoginCaptchaSubmit', capBody, captchaPage.url);
  const pwForm0 = parseFormHiddens(pwPage.text, 'LoginCaptchaSubmit');
  if (!pwForm0) throw new Error(`password form not found (url=${pwPage.url}, status=${pwPage.status})`);
  const pwFields0 = findRealFieldInputs(pwPage.text, 'LoginCaptchaSubmit', 'password');
  const hasPasswordField = pwFields0 && pwFields0.all.length > 0;

  if (hasPasswordField && pwFields0.real) {
    log(`password field: ${pwFields0.real.id} (${pwFields0.all.length} fields)`);
    // retry loop: portal 502/504 flakiness + "Invalid captcha selection" re-renders
    let page = pwPage;
    let afterPw = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      const pwForm = parseFormHiddens(page.text, 'LoginCaptchaSubmit');
      const pwFields = findRealFieldInputs(page.text, 'LoginCaptchaSubmit', 'password');
      if (!pwForm || !pwFields?.real) throw new Error('password form/fields lost on retry');
      const picks2 = await solveCaptcha(page.text, page.url);
      const submittedData = {};
      for (const f of pwFields.all) submittedData[f.id] = f.id === pwFields.real.id ? PORTAL_PASSWORD : '';
      const pwBody = [
        ['SelectedImages', picks2.join(',')],
        ['Id', pwForm.hiddens.Id ?? ''],
        ['ReturnUrl', pwForm.hiddens.ReturnUrl ?? ''],
        ['ResponseData', JSON.stringify(submittedData)],
        ['Param', pwForm.hiddens.Param ?? ''],
        ['__RequestVerificationToken', pwForm.hiddens.__RequestVerificationToken ?? ''],
      ];
      const res = await req('POST', '/Global/NewCaptcha/LoginCaptchaSubmit', {
        data: new URLSearchParams(pwBody).toString(),
        referer: page.url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE },
      });
      if (res.status >= 500) {
        log(`  ${res.status} from password submit (attempt ${attempt}) — refetching password page`);
        page = await req('GET', page.url, { headers: { Accept: 'text/html,...' } });
        continue;
      }
      if (res.text.includes('Invalid captcha selection')) {
        log(`  invalid captcha (attempt ${attempt}) — retrying on re-rendered challenge`);
        page = res;
        continue;
      }
      afterPw = res;
      break;
    }
    if (!afterPw) throw new Error('password submit retries exhausted');
    log(`after password: ${new URL(afterPw.url).pathname}`);
    await handlePostLogin(afterPw);
  } else {
    // maybe email step went straight through (no captcha this time) — check auth
    log('no password step — checking state');
    await handlePostLogin(pwPage);
  }

  async function handlePostLogin(page) {
    // forced password change?
    if (page.url.includes('changepassword') || page.text.includes('ChangeUserPassword')) {
      log('forced password change detected');
      const chForm = parseFormHiddens(page.text, 'ChangeUserPassword');
      if (!chForm) throw new Error('changepassword form not found');
      const newPassword = `Vs${crypto.randomInt(1000, 9999)}!${crypto.randomBytes(3).toString('hex')}`;
      const chBody = [
        ['CurrentPassword', PORTAL_PASSWORD],
        ['NewPassword', newPassword],
        ['ConfirmPassword', newPassword],
        ...Object.entries(chForm.hiddens),
      ];
      const chRes = await postForm('/Global/account/ChangeUserPassword', chBody, page.url, true);
      log(`password change -> ${chRes.status} ${chRes.text.slice(0, 120)}`);
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'new-portal-password.txt'), newPassword);
      log(`NEW PORTAL PASSWORD: ${newPassword} (saved to evidence)`);
    }
  }

  // ===== verify authenticated =====
  const home = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' } });
  if (home.url.includes('LogIn') || home.url.includes('login')) {
    throw new Error(`not authenticated: redirected to ${home.url}`);
  }
  log('AUTHENTICATED ✅');

  // ===== STATUS: parse applicant rows =====
  const rows = [...home.text.matchAll(/<div class="row border p-3 rounded-3 mb-2[\s\S]*?<\/div>\s*<\/div>/gi)].map((m) => m[0]);
  const applicants = [];
  for (const rowHtml of rows) {
    const text = rowHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const editId = rowHtml.match(/ManageApplicant\('([^']+)'/)?.[1] || null;
    const statusMatch = text.match(/(Form Filling In-Progress|Ready To Book Appointment)/i);
    applicants.push({ text: text.slice(0, 200), portalApplicantId: editId, status: statusMatch ? statusMatch[1] : 'UNKNOWN' });
    log(`applicant row: ${text.slice(0, 120)} [${statusMatch ? statusMatch[1] : 'UNKNOWN'}] id=${editId}`);
  }
  if (applicants.length === 0) log('no applicant rows found (page snippet):', home.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300));

  // ===== BOOK: open booking UI (SAFE STOP — CON-006) =====
  let page = await req('GET', '/Global/appointment/newappointment', { headers: { Accept: 'text/html,...' } });
  let guard = 0;
  while (guard++ < 5) {
    const url = new URL(page.url).pathname;
    if (/VisaType/i.test(url) || page.text.includes('Visa Type Selection')) {
      log('BOOKING UI OPEN: Visa Type Selection reached — SAFE STOP (CON-006, no submit) 🛑');
      break;
    }
    if (/DataProtection/i.test(url) || page.text.includes('data protection information')) {
      log('data protection consent page — looking for accept control');
      // find the accept button / form in the page
      const dpForm = page.text.match(/<form[^>]*>[\s\S]*?<\/form>/i);
      if (dpForm) log('  dp page has form:', (dpForm[0].match(/action="([^"]*)"/) || [])[1]);
      throw new Error('dp consent handling needs the accept request — inspect evidence and extend');
    }
    if (/AppointmentCaptcha/i.test(url) || page.text.includes('captchaForm')) {
      log('appointment captcha page — solving');
      const apForm = parseFormHiddens(page.text, 'appointmentcaptcha');
      if (!apForm) throw new Error('appointment captcha form not found');
      const picks = await solveCaptcha(page.text, page.url);
      const action = (page.text.match(/<form[^>]*action="([^"]*appointmentcaptcha[^"]*)"/i) || [])[1];
      const body = [['SelectedImages', picks.join(',')], ...Object.entries(apForm.hiddens)];
      page = await postForm(action, body, page.url);
      continue;
    }
    log(`unexpected booking page state: ${url} — stopping`);
    break;
  }

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'result.json'),
    JSON.stringify({ ok: true, login: 'authenticated', applicants, booking: 'safe-stop reached' }, null, 2),
  );
  log('DONE — evidence in ' + EVIDENCE_DIR);
}

main().catch((e) => {
  console.error('FLOW FAILED:', e.message);
  process.exitCode = 1;
});
