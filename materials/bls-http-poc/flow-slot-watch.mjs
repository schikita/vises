// Slot watcher — background monitor for BLS slot availability.
// Rounds of the proven flow-book.mjs walk (resume session when alive, full
// re-login when expired), sleeping between rounds. Stops when slots appear
// (calendar / video verification) or after max rounds.
//
// Each round costs ~1 booking-captcha submit (portal budget ~3/hour per
// account) — keep SLOT_WATCH_POLL_MS >= 20-30 min.
//
// Usage:
//   MAIL_LOCAL=... PORTAL_PASSWORD='...' [PASSPORT_NUMBER=... MOBILE=...] \
//   node flow-slot-watch.mjs
// Env:
//   SLOT_WATCH_POLL_MS      (default 25 min) sleep between rounds (+0-2 min jitter)
//   SLOT_WATCH_MAX_ROUNDS   (default 8)      hard stop
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const POLL_MS = Number(process.env.SLOT_WATCH_POLL_MS || 25 * 60 * 1000);
const MAX_ROUNDS = Number(process.env.SLOT_WATCH_MAX_ROUNDS || 8);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// If the portal forced a password change in an earlier round, flow-book persisted
// the rotated password — prefer it over the (now stale) env value.
const resolvePassword = () => {
  try {
    const rotated = fs.readFileSync(path.join('evidence-book', 'new-portal-password.txt'), 'utf8').trim();
    if (rotated && rotated !== process.env.PORTAL_PASSWORD) {
      if (resolvePassword.lastSeen !== rotated) log(`using rotated portal password from evidence (${rotated.slice(0, 3)}…)`);
      resolvePassword.lastSeen = rotated;
      return rotated;
    }
  } catch { /* no rotated password yet */ }
  return process.env.PORTAL_PASSWORD || '';
};

const runRound = (round) =>
  new Promise((resolve) => {
    const resume = round > 1 || fs.existsSync('bls-session.json');
    const out = fs.openSync(`flow-slot-watch-round${round}.log`, 'w');
    const child = spawn(process.execPath, ['flow-book.mjs', ...(resume ? ['--resume'] : [])], {
      cwd: process.cwd(),
      env: { ...process.env, PORTAL_PASSWORD: resolvePassword() },
      stdio: ['ignore', out, out],
    });
    child.on('exit', (code) => {
      fs.closeSync(out);
      const text = fs.readFileSync(`flow-slot-watch-round${round}.log`, 'utf8');
      // Order matters: video verification = success-stop; 'unexpected booking page
      // state' may be the CALENDAR with open slots (never observed live) — surface
      // it for human inspection instead of sleeping past an open slot.
      let state = 'needs_attention';
      if (/VIDEO VERIFICATION/i.test(text)) state = 'slots_open';
      else if (/slots are not available/i.test(text)) state = 'slots_unavailable';
      else if (/resumed session not authenticated|not authenticated: redirected/i.test(text)) state = 'session_dead';
      else if (/FLOW FAILED/i.test(text)) state = 'failed';
      resolve({ code, state, text });
    });
  });

const main = async () => {
  log(`slot watcher: max ${MAX_ROUNDS} rounds, ${POLL_MS / 60000}min between (captcha budget ~3/hour per account)`);
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    log(`--- round ${round}/${MAX_ROUNDS} ---`);
    let r = await runRound(round);
    // session died → one full re-login round (flow-book handles login + walk)
    if (r.state === 'session_dead') {
      log('session expired — running full login round');
      const sessBak = fs.existsSync('bls-session.json') ? fs.readFileSync('bls-session.json', 'utf8') : null;
      if (sessBak) fs.renameSync('bls-session.json', `bls-session.dead-r${round}.json`);
      r = await runRound(round); // no bls-session.json → full login path
    }
    if (r.state === 'slots_open') {
      log('🎬 SLOTS OPEN (video verification reached) — stopping for human handoff; session in bls-session.json');
      process.exit(0);
    }
    if (r.state === 'needs_attention') {
      log(`round ${r.code === 0 ? 'finished' : 'failed'} in an UNEXPECTED state — possibly the slot calendar;`);
      log(`  inspect flow-slot-watch-round${round}.log and evidence-book/booking-state-*.html`);
      log('  stopping (never sleep past a potentially open slot)');
      process.exit(2);
    }
    if (r.state === 'failed') {
      log(`round failed (exit ${r.code}) — see flow-slot-watch-round${round}.log tail:`);
      log('  ' + r.text.trimEnd().split('\n').slice(-3).join('\n  '));
      process.exit(1);
    }
    log(`round ${round}: slots unavailable (exit ${r.code})`);
    if (round === MAX_ROUNDS) { log('max rounds reached — stopping'); process.exit(0); }
    const wait = POLL_MS + Math.floor(Math.random() * 120000);
    log(`sleeping ${Math.round(wait / 60000)}min before next probe`);
    await sleep(wait);
  }
};
main().catch((e) => { console.error('WATCH FAILED:', e.message); process.exit(1); });
