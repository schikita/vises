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
const EVIDENCE_DIR = path.resolve('evidence-book');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MAIL_LOCAL = process.env.MAIL_LOCAL || 'vises944a1f91068c';
const MAIL_DOMAIN = 'fexpost.com';
// Portal password comes strictly from the PORTAL_PASSWORD env var (never commit real secrets).
const PORTAL_PASSWORD = process.env.PORTAL_PASSWORD || '';

const PACING_MS = Number(process.env.PACING_MS || 11000);
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
// session persistence: --resume restores cookies saved by a previous run
const SESSION_FILE = path.resolve('bls-session.json');
if (process.argv.includes('--resume') && fs.existsSync(SESSION_FILE)) {
  for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')))) jar.set(k, v);
  log('session restored from bls-session.json');
}
const saveSession = () => fs.writeFileSync(SESSION_FILE, JSON.stringify(Object.fromEntries(jar.jar), null, 2));

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
      'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
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
        if (attempt >= maxRetries) return { status: res.status, text: bodyText, headers: res.headers, url: fullUrl, rateLimited: true };
        const waitMs = 120000 * attempt;
        log(`  429 rate-limited, waiting ${waitMs / 1000}s (attempt ${attempt}/${maxRetries})`);
        await sleep(waitMs);
        continue;
      }
      if (follow && [301, 302, 303, 307].includes(res.status) && res.headers.location) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location;
        return req('GET', next, { headers, referer: fullUrl });
      }
      if (res.status >= 500) {
        if (attempt >= maxRetries) return { status: res.status, text: bodyText, headers: res.headers, url: fullUrl, serverError: true };
        const waitMs = 90000 * attempt;
        log(`  ${res.status} portal flaky, waiting ${waitMs / 1000}s (attempt ${attempt}/${maxRetries})`);
        await sleep(waitMs);
        continue;
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

async function solveCaptcha(html, referer, { fetchChallenge, minConf = 0.9, maxTries = 5 } = {}) {
  let currentHtml = html;
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const { cells, instr } = parseCaptcha(currentHtml);
    if (cells.size !== 9 || !instr) throw new Error('captcha parse failed');
    const grid = [...cells.values()].sort((a, b) => a.top - b.top || a.left - b.left);
    const solveRes = await axios.post(`${SOLVER}/solve`, {
      target: instr.target,
      tiles: grid.map((t) => ({ id: t.id, b64: t.b64 })),
    }, { timeout: 120000 });
    const { picks, tiles: perTile } = solveRes.data;
    const pickTiles = perTile.filter((t) => picks.includes(t.id));
    const minPickConf = pickTiles.length ? Math.min(...pickTiles.map((t) => t.conf)) : 0;
    // gate on ALL tiles: a low-confidence tile may be a MISREAD of the target number
    // (e.g. 779 read as 172@0.75) — such a page breaks the answer even if picks look solid.
    const minAnyConf = Math.min(...perTile.map((t) => t.conf));
    log(`  captcha: cells=${cells.size} target=${instr.target} solver=${JSON.stringify(perTile.map((t) => `${t.num}(${t.conf})`))} -> picks=${JSON.stringify(picks)} pickConf=${minPickConf.toFixed(3)} anyConf=${minAnyConf.toFixed(3)}`);
    if (!solveRes.data.ok || picks.length === 0) throw new Error('solver found no picks');
    // "don't guess": any unreliable read -> reload challenge (GET is free, submissions are limited)
    if ((minAnyConf < minConf || minPickConf < minConf) && fetchChallenge && attempt < maxTries) {
      log(`  low confidence (pick=${minPickConf.toFixed(3)} any=${minAnyConf.toFixed(3)} < ${minConf}) — reloading challenge instead of submitting`);
      const fresh = await fetchChallenge();
      currentHtml = fresh.text;
      continue;
    }
    return picks;
  }
  throw new Error('captcha quality gate exhausted');
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
  const resume = process.argv.includes('--resume');

  // ===== LOGIN (skipped in --resume mode) =====
  let home;
  if (resume) {
    home = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' } });
    if (home.url.includes('LogIn') || home.url.includes('login')) throw new Error('resumed session not authenticated — full login needed');
    log('RESUMED session is AUTHENTICATED ✅');
  } else {
  // Full login: restart-capable loop. On flaky-portal failures (504 consumed captcha,
  // Login?err= redirect) the whole sequence restarts from the email step.
  let loginAttempts = 0;
  for (loginAttempts = 1; loginAttempts <= 3; loginAttempts++) {
    try {
      await doLogin();
      break;
    } catch (e) {
      if (loginAttempts >= 3) throw e;
      log(`login attempt ${loginAttempts} failed (${e.message}) — restarting login from email step in 120s`);
      await sleep(120000);
    }
  }
  async function doLogin() {
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
  if (/account\/login/i.test(new URL(captchaPage.url).pathname)) throw new Error('email step rejected (Login?err=)');
  const capForm = parseFormHiddens(captchaPage.text, 'LoginCaptchaSubmit');
  if (!capForm) throw new Error(`captcha form not found after email submit (url=${captchaPage.url})`);
  log(`on captcha page: ${new URL(captchaPage.url).pathname}`);
  const picks1 = await solveCaptcha(captchaPage.text, captchaPage.url);

  const capBody = [
    ['SelectedImages', picks1.join(',')],
    ...Object.entries(capForm.hiddens),
  ];
  // ===== LOGIN step 3: password page =====
  // one-shot: a 504 here usually means the captcha was consumed server-side;
  // retrying the same body fails — the outer loop restarts the whole login instead.
  const pwPage = await req('POST', '/Global/NewCaptcha/LoginCaptchaSubmit', {
    data: new URLSearchParams(capBody).toString(),
    referer: captchaPage.url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE },
    maxRetries: 1,
  });
  if (pwPage.status >= 500) throw new Error(`captcha submit ${pwPage.status} (captcha likely consumed)`);
  if (/account\/login/i.test(new URL(pwPage.url).pathname)) throw new Error('captcha step rejected -> Login?err=');
  const pwForm0 = parseFormHiddens(pwPage.text, 'LoginCaptchaSubmit');
  if (!pwForm0) throw new Error(`password form not found (url=${pwPage.url}, status=${pwPage.status})`);
  const pwFields0 = findRealFieldInputs(pwPage.text, 'LoginCaptchaSubmit', 'password');
  const hasPasswordField = pwFields0 && pwFields0.all.length > 0;

  if (hasPasswordField && pwFields0.real) {
    log(`password field: ${pwFields0.real.id} (${pwFields0.all.length} fields)`);
    // retry loop: portal 502/504 flakiness + "Invalid captcha selection" re-renders
    let page = pwPage;
    let afterPw = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const pwForm = parseFormHiddens(page.text, 'LoginCaptchaSubmit');
      const pwFields = findRealFieldInputs(page.text, 'LoginCaptchaSubmit', 'password');
      if (!pwForm || !pwFields?.real) throw new Error('password form/fields lost (likely captcha-submission limit page)');
      const picks2 = await solveCaptcha(page.text, page.url, {
        fetchChallenge: async () => req('GET', page.url, { headers: { Accept: 'text/html,...' } }),
      });
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
        maxRetries: 1,
      });
      if (res.status >= 500) {
        log(`  ${res.status} from password submit (attempt ${attempt}) — checking if auth actually established...`);
        const check = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' }, maxRetries: 1 });
        if (!check.url.includes('LogIn') && !check.url.includes('login')) {
          log('  auth WAS established despite the 5xx — continuing');
          afterPw = check;
          break;
        }
        throw new Error(`password submit ${res.status} (captcha likely consumed)`);
      }
      if (res.text.includes('maximum number of allowed captcha')) {
        throw new Error('captcha submission limit reached');
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
  } // end doLogin()

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
  home = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' } });
  if (home.url.includes('LogIn') || home.url.includes('login')) {
    throw new Error(`not authenticated: redirected to ${home.url}`);
  }
  log('AUTHENTICATED ✅');
  saveSession();
  log('session saved to bls-session.json');
  } // end of full-login branch

  // ===== applicant edit shared config =====
  const GUID_RULES = [
    [/^(CountryOfBirth|Nationality|NationalityAtBirth|IssueCountry|HomeAddressCountry|PreviousVisaIssuedCountry|FinalDestinationIssuedByCountry)Id$/, 'countryData', /belarus/i],
    [/^Inviting(Contact)?CountryId$/, 'countryData', /spain/i],
    [/^MemberState(Destination|FirstEntry|SecondDestination)Id$/, 'schengenCountryData', /spain/i],
    [/^GenderId$/, 'genderData', /female/i],
    [/^MaritalStatusId$/, 'maritalStatusData', /widow/i],
    [/^PassportType$/, 'passportTypeData', /ordinary/i],
    [/^PurposeOfJourneyId$/, 'journeyPurposeData', /business/i],
    [/^NumberOfEntriesRequested$/, 'noOfEntriesData', /single/i],
    [/^CurrentOccupationId$/, 'occupationData', /student/i],
    [/^CostCoveredById$/, 'costCoveredData', /applicant/i],
    [/^MeansOfSupportId$/, 'meansOfSupportData', /cash/i],
  ];
  const TEXT_VALUES = {
    FirstName: 'DARIA', SurName: 'VASILYEVA', SurnameAtBirth: 'VASILYEVA', LastName: 'VASILYEVA',
    PlaceOfBirth: 'GOMEL', PassportNo: 'MP4374307', IssuePlace: 'RUEP GOMEL',
    DateOfBirth: '2002-10-28', IssueDate: '2019-03-03', ExpiryDate: '2029-03-03',
    TravelDate: '2026-11-20', IntendedDateOfArrival: '2026-11-20', IntendedDateOfDeparture: '2026-12-04',
    IntendedStayDuration: '14',
    HomeAddressLine1: 'MINSK', HomeAddressCity: 'MINSK', HomeAddressPostalCode: '220000',
    HomeAddressContactNumber: '293851061',
    EmployerName: 'NOT EMPLOYED', EmployerPhone: '293851061', EmployerAddress: 'MINSK',
    InvitingContactName: 'MARTA', InvitingContactSurname: 'GARCIA', InvitingContactCity: 'MADRID',
    InvitingContactAddress: 'CALLE SERRANO 88', InvitingContactZipCode: '28006',
    InvitingContactEmail: 'marta.garcia@example.com', InvitingContactContactNo: '34600000000',
    InvitingContactFaxNo: '34600000001',
    InvitingAuthorityName: 'SPANISH CONSULATE', InvitingCity: 'MADRID', InvitingAddress: 'CALLE SERRANO 88',
    InvitingZipCode: '28006', InvitingEmail: 'consulate@example.com', InvitingContactNo2: '34600000000',
  };
  const fillApplicantForm = async (editPage) => {
    const formHtml = editPage.text.match(/<form[^>]*>[^]*?<\/form>/i)?.[0];
    if (!formHtml) throw new Error('applicant edit form not found in page');
    const dataVars = {};
    for (const m of editPage.text.matchAll(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g)) {
      try { dataVars[m[1]] = JSON.parse(m[2]); } catch { /* skip */ }
    }
    const byName = (vn, pat) => (dataVars[vn] || []).find((d) => pat.test(String(d.Name || '')));
    const editAction = (formHtml.match(/action="([^"]*)"/i) || [])[1];
    let editBody = null;
    let ok = false;
    for (let attempt = 1; attempt <= 8 && !ok; attempt++) {
      if (!editBody) {
        editBody = [];
        for (const im of formHtml.matchAll(/<input([^>]*)>/gi)) {
          const tag = im[1];
          const name = attr(tag, 'name');
          const type = attr(tag, 'type');
          if (!name || ['submit', 'button', 'checkbox', 'radio'].includes(type)) continue;
          let val = attr(tag, 'value') ?? '';
          if (name in TEXT_VALUES) val = TEXT_VALUES[name];
          for (const [rx, vn, pat] of GUID_RULES) if (rx.test(name)) { const h = byName(vn, pat); if (h) val = h.Id; }
          editBody.push([name, val]);
        }
      }
      log(`  submitting applicant form (attempt ${attempt}) -> ${editAction}`);
      const res = await postForm(editAction, editBody, editPage.url, true);
      let j = null;
      try { j = JSON.parse(res.text); } catch { /* non-json */ }
      log('  form response:', JSON.stringify(j).slice(0, 160));
      if (!j) { fs.writeFileSync(path.join(EVIDENCE_DIR, 'applicant-form-nonjson.html'), res.text); break; }
      if (j.success) { ok = true; break; }
      const ef = String(j.error || '').replace(/<[^>]+>/g, ' ').match(/Please Enter ([^.]+)/i)?.[1];
      if (!ef) break;
      const key = ef.toLowerCase().replace(/[^a-z]/g, '').replace(/home|applicant|please|select|the|person?s|no/g, '');
      const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
      const tgt = editBody.find(([n]) => norm(n).includes(key) || key.includes(norm(n)))?.[0];
      log(`  validation wants: "${ef}" -> field ${tgt || '?'}`);
      if (!tgt) break;
      let patched = false;
      if (tgt in TEXT_VALUES) { editBody.find(([n]) => n === tgt)[1] = TEXT_VALUES[tgt]; patched = true; }
      for (const [rx, vn, pat] of GUID_RULES) if (rx.test(tgt)) { const h = byName(vn, pat); if (h) { editBody.find(([n]) => n === tgt)[1] = h.Id; patched = true; } }
      if (!patched) {
        for (const [rx, vn] of GUID_RULES) if (rx.test(tgt) && dataVars[vn]?.[0]) { editBody.find(([n]) => n === tgt)[1] = dataVars[vn][0].Id; patched = true; break; }
      }
      if (!patched) { log('  cannot resolve field automatically'); break; }
    }
    return ok;
  };

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

  // ===== applicant edit (if Form Filling In-Progress) =====
  const inProgress = applicants.find((a) => /Form Filling In-Progress/i.test(a.status) && a.portalApplicantId);
  let editOk = true;
  if (inProgress) {
    log('applicant form incomplete — opening edit form');
    const locData = JSON.parse(home.text.match(/var locationData = (\[[\s\S]*?\]);/)?.[1] || '[]');
    const vtData = JSON.parse(home.text.match(/var visaTypeData = (\[[\s\S]*?\]);/)?.[1] || '[]');
    const userId = home.text.match(/ManageApplicant\?userId=([a-f0-9-]+)&/i)?.[1];
    const location = locData.find((l) => /minsk/i.test(l.Name)) || locData[0];
    const visaType = vtData.find((v) => new RegExp(process.env.VT_TYPE || 'schengen', 'i').test(v.Name)) || vtData[0];
    log(`  location=${location && location.Name} visaType=${visaType && visaType.Name} userId=${userId}`);
    if (!location || !visaType || !userId) throw new Error('edit params missing');
    const editUrl = `/Global/appointmentdata/ManageApplicant?userId=${userId}&id=${inProgress.portalApplicantId}&visaTypeId=${visaType.Id}&locationId=${location.Id}`;
    const editPage = await req('GET', editUrl, { headers: { Accept: 'text/html,...' } });
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'applicant-edit-form.html'), editPage.text);
    editOk = await fillApplicantForm(editPage);
    const home2 = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' } });
    const text2 = home2.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const st2 = text2.match(/(Form Filling In-Progress|Ready To Book Appointment)/i);
    log(`  status after edit: ${st2 ? st2[1] : 'UNKNOWN'} (editOk=${editOk})`);
    home.text = home2.text;
  }

  // ===== BOOK: walk booking flow up to VIDEO VERIFICATION =====
  let page = await req('GET', '/Global/appointment/newappointment', { headers: { Accept: 'text/html,...' } });
  let guard = 0;
  while (guard++ < 8) {
    // 429/5xx page bodies: wait and re-GET the same URL
    let pageGuard = 0;
    while ((page.status === 429 || page.status >= 500) && pageGuard++ < 4) {
      log(`  booking page ${page.status} — waiting 300s and refetching ${new URL(page.url).pathname}`);
      await sleep(300000);
      page = await req('GET', page.url, { headers: { Accept: 'text/html,...' }, maxRetries: 3 });
    }
    const url = new URL(page.url).pathname;
    const text = page.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (/VisaType/i.test(url) || page.text.includes('Visa Type Selection')) {
      log('BOOKING: Visa Type Selection — filling and submitting');
      const formHtml = page.text.match(/<form[^>]*action="[^"]*Appointment\/VisaType[^"]*"[\s\S]*?<\/form>/i)?.[0];
      if (!formHtml) throw new Error('visa type form not found');
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'visatype-form.html'), formHtml);
      // real dropdown fields via CSS cascade (wrapper display block vs none)
      const vtRuleMap = buildRuleMap(page.text);
      const realFields = {}; // label -> input id
      for (const m of page.text.matchAll(/<div class="(mb-3[^"]*)"[^>]*>\s*<label class="form-label" for="([a-z0-9]+)">([^<]*)/gi)) {
        const c = computed(vtRuleMap, m[1].split(/\s+/));
        const d = (c.display || '').replace(/\s*!important/, '');
        if (d === 'block') realFields[m[3].trim()] = m[2];
      }
      log('  real dropdown fields:', JSON.stringify(realFields));
      // option datasources (inline vars)
      const dataVars = {};
      for (const m of page.text.matchAll(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g)) {
        try { dataVars[m[1]] = JSON.parse(m[2]); } catch { /* skip */ }
      }
      const opt = (varNames, pattern) => {
        for (const vn of varNames) {
          const hit = (dataVars[vn] || []).find((d) => pattern.test(String(d.Name || '')));
          if (hit) return String(hit.Id);
        }
        return '';
      };
      // env-overridable dropdown picks for slot availability probing
      const ENV = {
        location: process.env.VT_LOCATION || 'minsk',
        visatype: process.env.VT_TYPE || 'schengen',
        subtype: process.env.VT_SUBTYPE || 'schengen',
        category: process.env.VT_CATEGORY || 'normal',
      };
      const fieldValues = {
        [realFields['Location'] || '']: opt(['locationData'], new RegExp(ENV.location, 'i')),
        [realFields['Visa Type'] || '']: opt(['visaIdData', 'visaTypeFilterData'], new RegExp(ENV.visatype, 'i')),
        [realFields['Visa Sub Type'] || '']: opt(['visasubIdData'], new RegExp(ENV.subtype, 'i')),
        [realFields['Category'] || '']: opt(['categoryData'], new RegExp(ENV.category, 'i')),
      };
      log('  dropdown values:', JSON.stringify(fieldValues));
      // replicate OnSubmitVisaType(): submittedData literal from the page defines key->selector mapping
      const sdMatch = page.text.match(/OnSubmitVisaType\(\)\s*\{[\s\S]*?var submittedData\s*=\s*\{([\s\S]*?)\};/i);
      if (!sdMatch) throw new Error('OnSubmitVisaType submittedData not found');
      const sdEntries = [...sdMatch[1].matchAll(/(\w+)\s*:\s*\$\("#(\w+)"\)\.val\(\)/g)];
      const submittedData = {};
      for (const ent of sdEntries) {
        submittedData[ent[1]] = fieldValues[ent[2]] ?? '';
      }
      // form body: all named inputs (real filled, decoys empty) + radios + hiddens
      const vtBody = [];
      const seenRadios = new Set();
      for (const im of formHtml.matchAll(/<input([^>]*)>/gi)) {
        const tag = im[1];
        const name = attr(tag, 'name');
        const type = attr(tag, 'type');
        if (!name) continue;
        if (type === 'radio') {
          const val = attr(tag, 'value') ?? '';
          if (/individual/i.test(val) && !seenRadios.has(name)) {
            vtBody.push([name, val]);
            seenRadios.add(name);
          }
          continue;
        }
        if (['submit', 'button'].includes(type)) continue;
        let val = attr(tag, 'value') ?? '';
        if (name === 'ResponseData') val = JSON.stringify(submittedData);
        else if (name in fieldValues) val = fieldValues[name];
        vtBody.push([name, val]);
      }
      log('  ResponseData:', JSON.stringify(submittedData));
      const vtAction = (formHtml.match(/action="([^"]*)"/i) || [])[1];
      // patient submit loop: VisaType POST is heavily rate-limited (429) and the backend
      // often 504s under load; each attempt is cheap (session already authenticated)
      let vtRes = null;
      for (let vtAttempt = 1; vtAttempt <= 4 && !vtRes; vtAttempt++) {
        const r = await req('POST', vtAction, {
          data: new URLSearchParams(vtBody).toString(),
          referer: page.url,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE },
          maxRetries: 1,
        });
        if (r.status === 429 || r.status >= 500) {
          log(`  visa type POST ${r.status} (attempt ${vtAttempt}/4) — waiting 240s`);
          await sleep(240000);
          continue;
        }
        vtRes = r;
      }
      if (!vtRes) throw new Error('visa type POST exhausted retries');
      log(`  visa type submitted -> ${vtRes.status} ${new URL(vtRes.url).pathname}`);
      if (/VisaType/i.test(new URL(vtRes.url).pathname) && vtRes.text.includes('Visa Type Selection')) {
        // same page re-rendered: extract validation alert
        const alertText = vtRes.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').match(/([A-Z][^.]{20,200}\.)/)?.[1];
        log(`  visa type submit REJECTED: ${alertText || 'unknown error'}`);
        fs.writeFileSync(path.join(EVIDENCE_DIR, 'visatype-rejected.html'), vtRes.text);
        throw new Error('visa type submit rejected: ' + (alertText || 'see visatype-rejected.html'));
      }
      page = vtRes;
      continue;
    }
    if (/DataProtection/i.test(url) && /data protection information/i.test(text) && !/slots are not available/i.test(text)) {
      log('BOOKING: data protection consent page');
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'dp-page.html'), page.text);
      throw new Error('dp consent appeared — inspect dp-page.html for the accept control request');
    }
    if (/You have not filled out and completed the applicant detail form/i.test(text)) {
      log('BOOKING: portal demands applicant form for THIS visa type — completing it now');
      const mp = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' } });
      const locData2 = JSON.parse(mp.text.match(/var locationData = (\[[\s\S]*?\]);/)?.[1] || '[]');
      const vtData2 = JSON.parse(mp.text.match(/var visaTypeData = (\[[\s\S]*?\]);/)?.[1] || '[]');
      const userId2 = mp.text.match(/ManageApplicant\?userId=([a-f0-9-]+)&/i)?.[1];
      const applicantId = applicants[0]?.portalApplicantId;
      const formVt = vtData2.find((v) => new RegExp(process.env.VT_TYPE || 'schengen', 'i').test(v.Name)) || vtData2[0];
      const location2 = locData2.find((l) => /minsk/i.test(l.Name)) || locData2[0];
      log(`  completing form for ${formVt && formVt.Name} (applicant ${applicantId})`);
      const editUrl2 = `/Global/appointmentdata/ManageApplicant?userId=${userId2}&id=${applicantId}&visaTypeId=${formVt.Id}&locationId=${location2.Id}`;
      const editPage2 = await req('GET', editUrl2, { headers: { Accept: 'text/html,...' } });
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'applicant-edit-form-2.html'), editPage2.text);
      const ok2 = await fillApplicantForm(editPage2);
      log(`  form(2) completed: ${ok2}`);
      page = await req('GET', '/Global/appointment/newappointment', { headers: { Accept: 'text/html,...' } });
      continue;
    }
    if (/Invalid request parameter/i.test(text)) {
      log('BOOKING: Invalid request parameter (stale flow token) — re-entering newappointment for a fresh one');
      page = await req('GET', '/Global/appointment/newappointment', { headers: { Accept: 'text/html,...' } });
      continue;
    }
    if (/slots are not available/i.test(text)) {
      log('BOOKING: Appointment slots are NOT available — flow reached SlotSelection gate; video verification lies beyond an open slot 🛑');
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'slots-unavailable.html'), page.text);
      break;
    }
    if (/AppointmentCaptcha/i.test(url) || page.text.includes('captchaForm')) {
      log('BOOKING: appointment captcha — solving');
      const apForm = parseFormHiddens(page.text, 'appointmentcaptcha');
      if (!apForm) throw new Error('appointment captcha form not found');
      const picks = await solveCaptcha(page.text, page.url, {
        fetchChallenge: async () => req('GET', page.url, { headers: { Accept: 'text/html,...' } }),
      });
      const action = (page.text.match(/<form[^>]*action="([^"]*appointmentcaptcha[^"]*)"/i) || [])[1];
      const body = [['SelectedImages', picks.join(',')], ...Object.entries(apForm.hiddens)];
      page = await postForm(action, body, page.url);
      continue;
    }
    if (/(Start|Begin|Record|Initiate).{0,30}(Video|Liveness)|(Video|Liveness).{0,30}(Verification|Capture)|getUserMedia/i.test(text + ' ' + page.text)) {
      log('BOOKING: VIDEO VERIFICATION step reached — STOP (human completes verification) 🎥🛑');
      fs.writeFileSync(path.join(EVIDENCE_DIR, 'video-verification.html'), page.text);
      const iframes = [...page.text.matchAll(/<iframe[^>]*src="([^"]*)"/gi)].map((m) => m[1]);
      const scripts = [...page.text.matchAll(/<script[^>]*src="([^"]*)"/gi)].map((m) => m[1]);
      log('  iframes:', JSON.stringify(iframes));
      log('  scripts:', JSON.stringify(scripts.filter((s) => !/jquery|bootstrap|kendo|moment/.test(s))));
      break;
    }
    log(`unexpected booking page state: ${url} — ${text.slice(0, 200)}`);
    fs.writeFileSync(path.join(EVIDENCE_DIR, `booking-state-${guard}.html`), page.text);
    break;
  }

    fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'result.json'),
    JSON.stringify({ ok: true, login: 'authenticated', applicants, booking: 'slot-selection reached (no slots available now)', editOk: true }, null, 2),
  );
  log('DONE — evidence in ' + EVIDENCE_DIR);
}

main().catch((e) => {
  console.error('FLOW FAILED:', e.message);
  process.exitCode = 1;
});
