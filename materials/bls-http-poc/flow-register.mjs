// Browserless BLS REGISTER flow — VS-2538 (Дарья Васильева)
// Pure HTTP (axios) + local NN captcha solver backend (127.0.0.1:8788).
// No browser, no patchright. Moderate pacing; 429-aware backoff.
//
// Usage: node flow-register.mjs

import axios from 'file:///E:/my/vises/node_modules/axios/lib/axios.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BASE = 'https://appointment.blsspainbelarus.by';
const SOLVER = 'http://127.0.0.1:8788';
const EVIDENCE_DIR = path.resolve('evidence-register');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MAIL_LOCAL = process.env.MAIL_LOCAL || 'vises944a1f91068c';
const MAIL_DOMAIN = 'fexpost.com';

const PACING_MS = Number(process.env.PACING_MS || 7000); // unhurried
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
// FingerprintJS OSS sets this client-side; 32-hex murmur hash format.
jar.set('visitorId', crypto.randomBytes(16).toString('hex'));

// ---------------- http ----------------
let requestSeq = 0;
async function req(method, url, { data, headers = {}, referer, maxRetries = 3 } = {}) {
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
        timeout: 60000,
        maxRedirects: 0,
        validateStatus: () => true,
      });
      jar.absorb(res.headers['set-cookie']);
      const seq = ++requestSeq;
      const file = path.join(EVIDENCE_DIR, `${String(seq).padStart(2, '0')}-${method.toLowerCase()}-${new URL(fullUrl).pathname.replaceAll('/', '_').slice(0, 60)}.txt`);
      const bodyText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      const setCookies = (res.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('\n');
      fs.writeFileSync(file, `>> ${method} ${fullUrl}\n>> status ${res.status}\n>> cookie-sent: ${cookieHeader}\n>> set-cookie: ${setCookies}\n\n${bodyText}`);
      log(`${method} ${new URL(fullUrl).pathname} -> ${res.status} (${bodyText.length}b)`);
      if (res.status === 429) {
        const waitMs = 120000 * attempt;
        log(`  429 rate-limited, waiting ${waitMs / 1000}s (attempt ${attempt}/${maxRetries})`);
        await sleep(waitMs);
        continue;
      }
      return { status: res.status, text: bodyText, headers: res.headers, url: fullUrl };
    } catch (e) {
      log(`  network error: ${e.message} (attempt ${attempt}/${maxRetries})`);
      if (attempt === maxRetries) throw e;
      await sleep(15000 * attempt);
    }
  }
  throw new Error('rate limited after retries');
}

const postForm = async (url, fields, referer, { maxRetries = 3 } = {}) => {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await req('POST', url, {
      data: new URLSearchParams(fields).toString(),
      referer,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Origin: BASE,
      },
    });
    if (res.status === 200) return res;
    // 502 "Application Temporarily Unavailable" is transient backend flakiness —
    // the request was not processed (verified: no OTP mail arrives on 502).
    lastErr = new Error(`POST ${url} -> ${res.status}: ${res.text.slice(0, 200)}`);
    log(`  ${lastErr.message} (attempt ${attempt}/${maxRetries}, waiting 45s)`);
    await sleep(45000);
  }
  throw lastErr;
};

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

// ---------------- captcha widget parser (extract.js port) ----------------
function parseCaptcha(html) {
  const ruleMap = new Map();
  for (const sm of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const rm of sm[1].matchAll(/\.([a-z0-9]+)\s*\{([^}]*)\}/gi)) {
      if (!ruleMap.has(rm[1])) ruleMap.set(rm[1], []);
      ruleMap.get(rm[1]).push(rm[2]);
    }
  }
  const computed = (classes) => {
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
  const px = (v) => parseFloat(v) || 0;

  const tiles = [];
  for (const wm of html.matchAll(
    /<div\s+class="(col-4[^"]*)"\s+style="([^"]*)"\s+id="([^"]*)"[^>]*>\s*<img[^>]*class="captcha-img"[^>]*src="([^"]*)"/gi,
  )) {
    const c = computed(wm[1].split(/\s+/));
    const src = decodeEntities(wm[4]);
    const m = src.match(/^data:image\/[a-z+]+;base64,(.*)$/i);
    if (!m) continue;
    tiles.push({
      id: wm[3],
      hidden: c.display === 'none' || c.visibility === 'hidden',
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
    const c = computed(lm[1].split(/\s+/));
    labels.push({
      id: lm[2],
      target: lm[3],
      hidden: c.display === 'none' || c.visibility === 'hidden',
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

// ---------------- applicant (VS-2538) ----------------
// NOTE: portal rejects Cyrillic ("Special characters and numbers are not allowed")
// — ICAO-style transliteration required (validated in reference browser 2026-10-23).
const APPLICANT = {
  SurName: 'VASILYEVA',
  FirstName: 'DARIA',
  LastName: 'VASILYEVA', // lastNameAtBirth
  DateOfBirth: '2002-10-28',
  PassportType: 'Ordinary Passport',
  BirthCountry: 'Belarus',
  PassportNumber: process.env.PASSPORT_NUMBER || 'MP4374307',
  PassportIssueDate: '2019-03-03',
  PassportExpiryDate: '2029-03-03',
  IssuePlace: 'RUEP GOMEL',
  Mobile: process.env.MOBILE || '293851061',
  CountryCode: '+375',
  Email: `${MAIL_LOCAL}@${MAIL_DOMAIN}`,
};

// ---------------- tempmail.plus (public inbox, plain HTTP) ----------------
// UI-compatible API format (verified in reference browser): email=<local%40domain>&epin=
const MAIL_EPIN = process.env.MAIL_EPIN || '';
const mailListUrl = () => `https://tempmail.plus/api/mails?email=${encodeURIComponent(`${MAIL_LOCAL}@${MAIL_DOMAIN}`)}&limit=20&epin=${MAIL_EPIN}`;
const mailDetailUrl = (mailId) => `https://tempmail.plus/api/mails/${mailId}?email=${encodeURIComponent(`${MAIL_LOCAL}@${MAIL_DOMAIN}`)}&epin=${MAIL_EPIN}`;

async function fetchMailList() {
  const res = await axios.get(mailListUrl(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    timeout: 30000,
  });
  return res.data;
}

async function fetchMailBody(mailId) {
  const res = await axios.get(mailDetailUrl(mailId), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    timeout: 30000,
  });
  return res.data;
}

async function waitForMail(predicate, { timeoutMs = 180000, pollMs = 8000, sinceId = 0 } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    await sleep(pollMs);
    let list;
    try {
      list = await fetchMailList();
    } catch (e) {
      log(`  tempmail list error: ${e.message}`);
      continue;
    }
    const fresh = (list.mail_list || []).filter((m) => m.mail_id > sinceId);
    for (const m of fresh) {
      let body = null;
      try {
        body = await fetchMailBody(m.mail_id);
      } catch (e) {
        log(`  tempmail body error: ${e.message}`);
      }
      if (predicate(m, body)) return { meta: m, body };
    }
    log(`  waiting for mail... (seen ${list.count ?? (list.mail_list || []).length})`);
  }
  throw new Error('mail wait timeout');
}

// ---------------- flow ----------------
async function main() {
  // --- 1. register page: tokens + captcha url ---
  const reg1 = await req('GET', '/Global/Account/RegisterUser', { headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' } });
  if (!reg1.text.includes('id="myForm"')) throw new Error('register page form not found');
  const formChunk = reg1.text.match(/<form[^>]*id="myForm"[\s\S]*?<\/form>/i)?.[0];
  const hidden = {};
  for (const im of formChunk.matchAll(/<input([^>]*type="hidden"[^>]*)>/gi)) {
    const tag = im[1];
    const name = attr(tag, 'name');
    if (name && name !== '__Invariant') hidden[name] = attr(tag, 'value') ?? '';
  }
  log('hidden fields:', Object.keys(hidden).join(','));
  const captchaDataUrl = reg1.text.match(/GenerateCaptcha\?data=([A-Za-z0-9%+/=_-]+)/)?.[1];
  if (!captchaDataUrl) throw new Error('captcha data param not found');
  log('captcha data param ok, CaptchaId=' + hidden.CaptchaId);

  // --- 2. dropdown GUIDs (sequential, moderate pacing) ---
  const ptRes = await req('GET', '/Global/query/GetLOVIdNameList?lovType=BLS_PASSPORT_TYPE', {
    headers: { Accept: 'application/json, text/javascript, */*; q=0.01', 'X-Requested-With': 'XMLHttpRequest' },
  });
  const cRes = await req('GET', '/Global/query/GetCountryList', {
    headers: { Accept: 'application/json, text/javascript, */*; q=0.01', 'X-Requested-With': 'XMLHttpRequest' },
  });
  const ptList = JSON.parse(ptRes.text);
  const cList = JSON.parse(cRes.text);
  const passportTypeId = ptList.find((x) => x.Name === APPLICANT.PassportType)?.Id;
  const birthCountryId = cList.find((x) => x.Name === APPLICANT.BirthCountry)?.Id || cList.find((x) => x.Code === 'BY')?.Id;
  if (!passportTypeId || !birthCountryId) throw new Error(`guid not found: pt=${passportTypeId} bc=${birthCountryId}`);
  log(`PassportType GUID=${passportTypeId} BirthCountry GUID=${birthCountryId}`);

  // --- 3. captcha page + solve loop ---
  let captchaData = null;
  let otpArmed = false;
  for (let attempt = 1; attempt <= 6 && !captchaData; attempt++) {
    const cap = await req('GET', `/Global/CaptchaPublic/GenerateCaptcha?data=${captchaDataUrl}`, {
      referer: `${BASE}/Global/Account/RegisterUser`,
      headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    });
    if (cap.status !== 200 || !cap.text.includes('captchaForm')) {
      log(`captcha page bad status ${cap.status}, retry`);
      await sleep(30000);
      continue;
    }
    const capForm = cap.text.match(/<form[^>]*id="captchaForm"[\s\S]*?<\/form>/i)?.[0];
    const capFields = {};
    for (const im of capForm.matchAll(/<input([^>]*type="hidden"[^>]*)>/gi)) {
      const tag = im[1];
      const name = attr(tag, 'name');
      if (name) capFields[name] = attr(tag, 'value') ?? '';
    }
    const { tiles, labels, cells, instr } = parseCaptcha(cap.text);
    log(`captcha: tiles=${tiles.length} labels=${labels.length} cells=${cells.size} target=${instr && instr.target}`);
    if (cells.size !== 9 || !instr) {
      log('captcha parse incomplete, reload');
      continue;
    }
    const grid = [...cells.values()].sort((a, b) => a.top - b.top || a.left - b.left);
    const solveRes = await axios.post(`${SOLVER}/solve`, {
      target: instr.target,
      tiles: grid.map((t) => ({ id: t.id, b64: t.b64 })),
    }, { timeout: 120000 });
    const { picks, tiles: perTile } = solveRes.data;
    log('solver:', JSON.stringify(perTile.map((t) => `${t.id}=${t.num}(${t.conf})`)));
    if (!solveRes.data.ok || picks.length === 0) {
      log('solver returned no picks, reloading captcha');
      continue;
    }
    const submit = await postForm(
      '/Global/CaptchaPublic/SubmitCaptcha',
      {
        SelectedImages: picks.join(','),
        Id: capFields.Id,
        Captcha: capFields.Captcha,
        __RequestVerificationToken: capFields.__RequestVerificationToken,
      },
      `${BASE}/Global/CaptchaPublic/GenerateCaptcha?data=${captchaDataUrl}`,
    );
    let capJson = null;
    try {
      capJson = JSON.parse(submit.text);
    } catch {
      log(`captcha submit non-JSON (${submit.status}): ${submit.text.slice(0, 200)}`);
      continue;
    }
    log('captcha submit response:', JSON.stringify(capJson).slice(0, 200));
    if (capJson.exceeded) throw new Error('captcha exceeded');
    if (capJson.success && capJson.captcha) {
      captchaData = capJson.captcha;
      otpArmed = true;
    }
  }
  if (!captchaData) throw new Error('captcha not solved');
  log('CAPTCHA SOLVED (browserless, local NN)');

  // --- 4. send OTP ---
  // Exact field order replicated from the live browser ($('#myForm').serialize()).
  // Dates are DATE-ONLY strings; __Invariant repeats as separate pairs.
  const buildForm = ({ captchaData, emailOtp = '', encryptedEmail = '', encryptedMobile = '', securityCode = hidden.SecurityCode }) => ([
    ['Mode', hidden.Mode],
    ['CaptchaParam', ''],
    ['CaptchaData', captchaData],
    ['CaptchaId', hidden.CaptchaId],
    ['ServerDateOfBirth', APPLICANT.DateOfBirth],
    ['ServerPassportExpiryDate', APPLICANT.PassportExpiryDate],
    ['ServerPassportIssueDate', APPLICANT.PassportIssueDate],
    ['SecurityCode', securityCode],
    ['MobileVerificationEnabled', hidden.MobileVerificationEnabled || 'False'],
    ['EncryptedEmail', encryptedEmail],
    ['EncryptedMobile', encryptedMobile],
    ['SurName', APPLICANT.SurName],
    ['FirstName', APPLICANT.FirstName],
    ['LastName', APPLICANT.LastName],
    ['DateOfBirth', APPLICANT.DateOfBirth],
    ['__Invariant', 'DateOfBirth'],
    ['PassportType', passportTypeId],
    ['BirthCountry', birthCountryId],
    ['PassportNumber', APPLICANT.PassportNumber],
    ['PassportIssueDate', APPLICANT.PassportIssueDate],
    ['__Invariant', 'PassportIssueDate'],
    ['PassportExpiryDate', APPLICANT.PassportExpiryDate],
    ['__Invariant', 'PassportExpiryDate'],
    ['IssuePlace', APPLICANT.IssuePlace],
    ['CountryCode', APPLICANT.CountryCode],
    ['Mobile', APPLICANT.Mobile],
    ['Email', APPLICANT.Email],
    ['EmailOtp', emailOtp],
    ['__Invariant', 'EmailOtp'],
    ['__RequestVerificationToken', hidden.__RequestVerificationToken],
  ]);
  const form = buildForm({ captchaData });
  const otpRes = await postForm('/Global/account/SendRegisterUserVerificationCode', form, `${BASE}/Global/Account/RegisterUser`);
  let otpJson;
  try {
    otpJson = JSON.parse(otpRes.text);
  } catch {
    throw new Error(`OTP send non-JSON (${otpRes.status}): ${otpRes.text.slice(0, 300)}`);
  }
  log('send OTP response:', JSON.stringify(otpJson).slice(0, 300));
  if (!otpJson.success) throw new Error(`OTP send failed: ${otpJson.error}`);

  // --- 5. wait OTP mail ---
  const seen = await fetchMailList();
  const sinceId = Math.max(0, ...(seen.mail_list || []).map((m) => m.mail_id));
  log(`waiting for OTP mail to ${APPLICANT.Email} (since mail_id ${sinceId})`);
  const otpMail = await waitForMail(
    (m, body) => /verification|otp|code/i.test(m.subject || '') || (body && /(?:verification\s+code|OTP|код)[^0-9]{0,120}(\d{6})/i.test(JSON.stringify(body))),
    { sinceId, timeoutMs: 300000 },
  );
  const mailText = JSON.stringify(otpMail.body || {}) + ' ' + (otpMail.meta.subject || '');
  const otpMatch = mailText.match(/(?:email\s+verification\s+code|verification\s+code|OTP|Code|код|Код)[^0-9]{0,120}(\d{6})/i) || mailText.match(/\b(\d{6})\b/);
  if (!otpMatch) throw new Error(`OTP not found in mail: ${mailText.slice(0, 300)}`);
  const otp = otpMatch[1];
  log(`OTP extracted: ${otp}`);

  // --- 6. submit registration ---
  const finalForm = buildForm({
    captchaData,
    emailOtp: otp,
    encryptedEmail: otpJson.encryptEmail || '',
    encryptedMobile: otpJson.encryptMobile || '',
    securityCode: otpJson.securityCode || hidden.SecurityCode,
  });
  const regRes = await postForm('/Global/Account/RegisterUser', finalForm, `${BASE}/Global/Account/RegisterUser`);
  let regJson;
  try {
    regJson = JSON.parse(regRes.text);
  } catch {
    // maybe full-page redirect response
    throw new Error(`register submit non-JSON (${regRes.status}): ${regRes.text.slice(0, 300)}`);
  }
  log('register submit response:', JSON.stringify(regJson).slice(0, 300));
  if (!regJson.success) throw new Error(`register failed: ${regJson.error}`);
  log('REGISTER SUCCESS ✅');

  // --- 7. wait portal password mail ---
  const seen2 = await fetchMailList();
  const sinceId2 = Math.max(sinceId, ...(seen2.mail_list || []).map((m) => m.mail_id), otpMail.meta.mail_id);
  log(`waiting for password mail (since mail_id ${sinceId2})`);
  const pwMail = await waitForMail(
    // NOTE: welcome-mail subject is "Welcome To BLS Appointment System" — it has
    // no "password" keyword, a subject-only /password|login|…/ filter never matches
    // it (misdiagnosed as "mail never delivered" in the 2026-10-23 run).
    (m) => /password|login|credential|details|registration|welcome|appointment system/i.test(m.subject || ''),
    { sinceId: sinceId2, timeoutMs: 300000 },
  );
  const pwText = JSON.stringify(pwMail.body || {});
  const pwMatch = pwText.match(/(?:temporary\s+password|your\s+password|login\s+password|password|пароль|временный\s+пароль)[^0-9]{0,120}(\d{6})/i) || pwText.match(/\b(\d{6})\b/);
  if (!pwMatch) throw new Error(`password not found in mail: ${pwText.slice(0, 300)}`);
  log(`PORTAL PASSWORD: ${pwMatch[1]}`);

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'result.json'),
    JSON.stringify({ ok: true, email: APPLICANT.Email, portalPassword: pwMatch[1], otpJsonKeys: Object.keys(otpJson) }, null, 2),
  );
  log('evidence -> ' + path.join(EVIDENCE_DIR, 'result.json'));
}

main().catch((e) => {
  console.error('FLOW FAILED:', e.message);
  process.exitCode = 1;
});
