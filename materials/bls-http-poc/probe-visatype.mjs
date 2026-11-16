// One-off probe: resume session -> newappointment -> VisaType submit (Minsk/Schengen/Normal)
// -> report landing state (SlotSelection / "no slots" / "fill applicant form" / 429).
// Does NOT pick or reserve any slot. Usage: node probe-visatype.mjs
import axios from 'file:///E:/my/vises/node_modules/axios/lib/axios.js';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://appointment.blsspainbelarus.by';
const EVIDENCE_DIR = path.resolve('evidence-visatype-probe');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PACING_MS = 9000;
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CookieJar {
  constructor() { this.jar = new Map(); }
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
  header() { return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join('; '); }
  set(name, value) { this.jar.set(name, value); }
}
const jar = new CookieJar();
for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync('bls-session.json', 'utf8')))) jar.set(k, v);
log('session restored from bls-session.json');

let requestSeq = 0;
async function req(method, url, { data, headers = {}, referer } = {}) {
  const fullUrl = url.startsWith('http') ? url : BASE + url;
  await sleep(PACING_MS + Math.random() * 2000);
  const res = await axios.request({
    method, url: fullUrl, data,
    headers: {
      'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
      ...(referer ? { Referer: referer } : {}), ...headers,
      Cookie: jar.header(),
    },
    timeout: 90000, maxRedirects: 0, validateStatus: () => true,
  });
  jar.absorb(res.headers['set-cookie']);
  const bodyText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  const seq = ++requestSeq;
  fs.writeFileSync(path.join(EVIDENCE_DIR, `${String(seq).padStart(2, '0')}-${method.toLowerCase()}-${new URL(fullUrl).pathname.replaceAll('/', '_').slice(0, 55)}.txt`),
    `>> ${method} ${fullUrl}\n>> status ${res.status}\n\n${bodyText}`);
  // follow one redirect chain manually (GET only)
  if (res.status >= 300 && res.status < 400 && res.headers.location && method === 'GET' && !data) {
    const loc = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location;
    return req('GET', loc, { headers, referer: fullUrl });
  }
  return { status: res.status, text: bodyText, headers: res.headers, url: fullUrl };
}

const decodeEntities = (s) => String(s).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => { const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i')); return m ? decodeEntities(m[1]) : null; };

// ---- walk to the VisaType page ----
const auth = await req('GET', '/Global/appointmentdata/myappointments', { headers: { Accept: 'text/html,...' } });
if (auth.url.includes('LogIn') || auth.url.includes('login')) { console.error('PROBE FAILED: session not authenticated'); process.exit(1); }
log('session authenticated ✅');

let page = await req('GET', '/Global/appointment/newappointment', { headers: { Accept: 'text/html,...' } });
const url = new URL(page.url).pathname;
const text = page.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
if (!/VisaType/i.test(url) && !page.text.includes('Visa Type Selection')) {
  log(`newappointment did NOT reach VisaType — at ${url}: ${text.slice(0, 220)}`);
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'not-visatype.html'), page.text);
  process.exit(0);
}
log('on Visa Type Selection — building submit (Minsk / Schengen / Normal)');

const formHtml = page.text.match(/<form[^>]*action="[^"]*Appointment\/VisaType[^"]*"[\s\S]*?<\/form>/i)?.[0];
if (!formHtml) { console.error('PROBE FAILED: visa type form not found'); process.exit(1); }

// real dropdowns via CSS cascade
const ruleMap = new Map();
for (const sm of page.text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
  for (const rm of sm[1].matchAll(/\.([a-z0-9]+)\s*\{([^}]*)\}/gi)) {
    if (!ruleMap.has(rm[1])) ruleMap.set(rm[1], []);
    ruleMap.get(rm[1]).push(rm[2]);
  }
const computed = (classes) => {
  const out = {};
  for (const c of classes) for (const d of ruleMap.get(c) || []) for (const decl of d.split(';')) {
    const m = decl.match(/^\s*([a-z-]+)\s*:\s*([^;]+?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
};
const realFields = {};
for (const m of page.text.matchAll(/<div class="(mb-3[^"]*)"[^>]*>\s*<label class="form-label" for="([a-z0-9]+)">([^<]*)/gi)) {
  const c = computed(m[1].split(/\s+/));
  if ((c.display || '').replace(/\s*!important/, '') === 'block') realFields[m[3].trim()] = m[2];
}
log('real dropdown fields:', JSON.stringify(realFields));

const dataVars = {};
for (const m of page.text.matchAll(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g)) { try { dataVars[m[1]] = JSON.parse(m[2]); } catch { /* skip */ } }
const opt = (varNames, pattern) => {
  for (const vn of varNames) { const hit = (dataVars[vn] || []).find((d) => pattern.test(String(d.Name || ''))); if (hit) return String(hit.Id); }
  return '';
};
const fieldValues = {
  [realFields['Location'] || '']: opt(['locationData'], /minsk/i),
  [realFields['Visa Type'] || '']: opt(['visaIdData', 'visaTypeFilterData'], /schengen/i),
  [realFields['Visa Sub Type'] || '']: opt(['visasubIdData'], /schengen/i),
  [realFields['Category'] || '']: opt(['categoryData'], /normal/i),
};
log('dropdown values:', JSON.stringify(fieldValues));

const sdMatch = page.text.match(/OnSubmitVisaType\(\)\s*\{[\s\S]*?var submittedData\s*=\s*\{([\s\S]*?)\};/i);
if (!sdMatch) { console.error('PROBE FAILED: OnSubmitVisaType submittedData not found'); process.exit(1); }
const submittedData = {};
for (const ent of sdMatch[1].matchAll(/(\w+)\s*:\s*\$\("#(\w+)"\)\.val\(\)/g)) submittedData[ent[1]] = fieldValues[ent[2]] ?? '';

const vtBody = [];
const seenRadios = new Set();
for (const im of formHtml.matchAll(/<input([^>]*)>/gi)) {
  const tag = im[1];
  const name = attr(tag, 'name');
  const type = attr(tag, 'type');
  if (!name) continue;
  if (type === 'radio') {
    const val = attr(tag, 'value') ?? '';
    if (/individual/i.test(val) && !seenRadios.has(name)) { vtBody.push([name, val]); seenRadios.add(name); }
    continue;
  }
  if (['submit', 'button'].includes(type)) continue;
  let val = attr(tag, 'value') ?? '';
  if (name === 'ResponseData') val = JSON.stringify(submittedData);
  else if (name in fieldValues) val = fieldValues[name];
  vtBody.push([name, val]);
}
const vtAction = (formHtml.match(/action="([^"]*)"/i) || [])[1];
log('submitting', vtAction, 'ResponseData:', JSON.stringify(submittedData));

let vtRes = null;
for (let attempt = 1; attempt <= 2 && !vtRes; attempt++) {
  const r = await req('POST', vtAction, {
    data: new URLSearchParams(vtBody).toString(),
    referer: page.url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE },
  });
  if (r.status === 429 || r.status >= 500) { log(`  POST ${r.status} (attempt ${attempt}) — waiting 240s`); await sleep(240000); continue; }
  vtRes = r;
}
if (!vtRes) { console.error('PROBE FAILED: visa type POST rate-limited'); process.exit(1); }

const nextUrl = new URL(vtRes.url).pathname;
const nextText = vtRes.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
log(`visa type submitted -> ${vtRes.status} ${nextUrl}`);
fs.writeFileSync(path.join(EVIDENCE_DIR, 'after-visatype.html'), vtRes.text);
if (/slots are not available/i.test(nextText)) log('RESULT: SlotSelection reached — «Appointment slots are NOT available»');
else if (/SlotSelection/i.test(nextUrl)) log(`RESULT: SlotSelection reached — inspect calendar: ${nextText.slice(0, 300)}`);
else if (/VisaType/i.test(nextUrl)) log(`RESULT: REJECTED/re-rendered: ${nextText.match(/([A-Z][^.]{20,200}\.)/)?.[1] || nextText.slice(0, 300)}`);
else log(`RESULT: landed on ${nextUrl}: ${nextText.slice(0, 300)}`);
log('DONE (no slot was picked or reserved)');
