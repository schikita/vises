/**
 * Domain steps of the browserless BLS flow (register form, login chain,
 * applicant form, booking walk) on top of PortalHttpService.
 * Pure portal interaction — no DB/vault side effects (those live in clients).
 */
import { Injectable, Logger } from '@nestjs/common';
import { PortalHttpService } from './portal-http.service';
import { PortalHttpCaptchaService } from './portal-http-captcha.service';
import { decodeEntities, findRealFieldInputs, parseFormHiddens, readAttr, buildRuleMap, computedStyle } from './utils/portal-html.util';
import { generatePortalPassword } from '../bls-secrets/utils/generate-portal-password.util';

const LOGIN_OK = 'ok';
const LOGIN_NEED_PASSWORD_CHANGE = 'need_password_change';

export type LoginOutcome =
  | { state: typeof LOGIN_OK }
  | { state: typeof LOGIN_NEED_PASSWORD_CHANGE; pageUrl: string; pageHtml: string };

export type BookingWalkStop =
  | { state: 'slots_unavailable' }
  | { state: 'dp_pending' }
  | { state: 'session_expired' }
  | { state: 'stale_booking_request' }
  | { state: 'applicant_form_required' }
  | { state: 'video_verification'; html: string }
  | { state: 'calendar'; html: string }
  | { state: 'unknown'; html: string; url: string; banner?: string | null };

@Injectable()
export class PortalHttpFlowService {
  private readonly logger = new Logger(PortalHttpFlowService.name);

  constructor(
    private readonly http: PortalHttpService,
    private readonly captcha: PortalHttpCaptchaService,
  ) {}

  // ---------- login ----------
  async login(email: string, password: string): Promise<LoginOutcome> {
    // Session reuse: an authenticated cookie jar (~30 min per POC notes) lets
    // consecutive engine tasks skip the email+captcha+password chain — each
    // full login burns ~2 captcha submissions on a ~3/hour account budget.
    if (await this.isAuthenticated()) {
      return { state: LOGIN_OK };
    }
    const loginPage = await this.http.get('/Global/account/login');
    const emailForm = findRealFieldInputs(loginPage.text, 'text');
    if (!emailForm?.real) throw new Error('real email input not found on login page');
    const hiddens = parseFormHiddens(loginPage.text, 'LoginSubmit') || {};
    const submittedData: Record<string, string> = {};
    const body: Array<[string, string]> = [];
    for (const f of emailForm.all) {
      const val = f.id === emailForm.real.id ? email : '';
      body.push([f.name, val]);
      submittedData[f.id] = val; // OnSubmitVerify packs ALL fields into ResponseData JSON
    }
    for (const [k, v] of Object.entries(hiddens)) body.push([k, v]);
    const rdIdx = body.findIndex(([k]) => k === 'ResponseData');
    if (rdIdx >= 0) body[rdIdx]![1] = JSON.stringify(submittedData);

    // one-shot: a 5xx may mean the submission reached the portal (response
    // lost); an in-place retry reposts a consumed antiforgery token and gets
    // Login?err=. Fail the stage instead — the task retry restarts it fresh.
    const captchaPage = await this.http.postForm('/Global/account/LoginSubmit', body, loginPage.url, { maxRetries: 1 });
    if (captchaPage.status >= 500) {
      throw new Error(`login email submit ${captchaPage.status} (stage restart)`);
    }
    if (/account\/login/i.test(new URL(captchaPage.url).pathname)) {
      throw new Error('login email step rejected (Login?err=)');
    }
    const capHiddens = parseFormHiddens(captchaPage.text, 'LoginCaptchaSubmit');
    if (!capHiddens) throw new Error('login captcha form not found');
    const { picks } = await this.captcha.solve({ html: captchaPage.text }); // one-shot page: no re-fetch
    const capBody: Array<[string, string]> = [['SelectedImages', picks.join(',')], ...Object.entries(capHiddens)];
    // one-shot: a 5xx here means the captcha was consumed — no in-place retry
    const pwPage = await this.http.req('POST', '/Global/NewCaptcha/LoginCaptchaSubmit', {
      data: new URLSearchParams(capBody).toString(),
      referer: captchaPage.url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRetries: 1,
    });
    if (pwPage.status >= 500) throw new Error(`login captcha submit ${pwPage.status} (captcha likely consumed)`);

    const pwFields = findRealFieldInputs(pwPage.text, 'password');
    if (!pwFields?.real) throw new Error('password fields not found after captcha');
    const pwHiddens = parseFormHiddens(pwPage.text, 'LoginCaptchaSubmit') || {};
    const pwData: Record<string, string> = {};
    for (const f of pwFields.all) pwData[f.id] = f.id === pwFields.real.id ? password : '';
    const pwSolve = await this.captcha.solve({ html: pwPage.text });
    const pwBody: Array<[string, string]> = [
      ['SelectedImages', pwSolve.picks.join(',')],
      ['Id', pwHiddens.Id ?? ''],
      ['ReturnUrl', pwHiddens.ReturnUrl ?? ''],
      ['ResponseData', JSON.stringify(pwData)],
      ['Param', pwHiddens.Param ?? ''],
      ['__RequestVerificationToken', pwHiddens.__RequestVerificationToken ?? ''],
    ];
    const res = await this.http.req('POST', '/Global/NewCaptcha/LoginCaptchaSubmit', {
      data: new URLSearchParams(pwBody).toString(),
      referer: pwPage.url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRetries: 1,
    });
    if (res.status >= 500) throw new Error(`password submit ${res.status}`);
    if (res.text.includes('Invalid captcha selection')) throw new Error('login invalid captcha selection');
    if (res.text.includes('maximum number of allowed captcha')) throw new Error('captcha submission limit reached');
    if (/changepassword/i.test(res.url) || res.text.includes('ChangeUserPassword')) {
      return { state: LOGIN_NEED_PASSWORD_CHANGE, pageUrl: res.url, pageHtml: res.text };
    }
    // Verify the session actually established: under portal rate limiting the
    // chain can "succeed" (captchas accepted) without a valid session cookie —
    // walking then bounces to LogIn and burns another login's captchas.
    if (!(await this.isAuthenticated())) {
      throw new Error('login chain completed but session not established (portal rate limit suspected)');
    }
    return { state: LOGIN_OK };
  }

  /**
   * Resolve the ManageApplicant edit URL for the primary applicant from
   * myappointments inline data (GUIDs regenerate per render). Shared by the
   * STATUS step and the BOOKING step (applicant form required for the
   * selected visa type).
   */
  async resolveApplicantEditUrl(input: {
    visaType: RegExp;
    location: RegExp;
  }): Promise<string | null> {
    const mp = await this.http.get('/Global/appointmentdata/myappointments');
    const userId = mp.text.match(/ManageApplicant\?userId=([a-f0-9-]+)&/i)?.[1];
    const locId = (
      JSON.parse(mp.text.match(/var locationData = (\[[\s\S]*?\]);/)?.[1] || '[]') as Array<
        { Id: string; Name: string }
      >
    ).find((l) => input.location.test(l.Name))?.Id;
    const vtId = (
      JSON.parse(mp.text.match(/var visaTypeData = (\[[\s\S]*?\]);/)?.[1] || '[]') as Array<
        { Id: string; Name: string }
      >
    ).find((v) => input.visaType.test(v.Name))?.Id;
    const portalApplicantId = mp.text.match(/ManageApplicant\('([^']+)'/)?.[1];
    if (!userId || !locId || !vtId || !portalApplicantId) return null;
    return `/Global/appointmentdata/ManageApplicant?userId=${userId}&id=${portalApplicantId}&visaTypeId=${vtId}&locationId=${locId}`;
  }

  async isAuthenticated(): Promise<boolean> {
    const res = await this.http.get('/Global/appointmentdata/myappointments');
    return res.status === 200 && !/LogIn|account\/login/i.test(res.url);
  }

  /**
   * Login with inline forced-password-change handling: the portal demands a
   * change on logins from unfamiliar IPs (proxy rotations), blocking the
   * session until it completes. Rotate once, report the new password via
   * onRotated (callers persist it), then re-login — at most twice before
   * treating a change loop as a failure.
   */
  async loginEnsureRotated(
    email: string,
    password: string,
    onRotated: (newPassword: string) => Promise<void>,
  ): Promise<LoginOutcome> {
    let pw = password;
    for (let round = 0; round < 2; round++) {
      const outcome = await this.login(email, pw);
      if (outcome.state !== LOGIN_NEED_PASSWORD_CHANGE) {
        return outcome;
      }
      const hiddens = parseFormHiddens(outcome.pageHtml, 'ChangeUserPassword') || {};
      const newPassword = generatePortalPassword();
      const body: Array<[string, string]> = [
        ['CurrentPassword', pw],
        ['NewPassword', newPassword],
        ['ConfirmPassword', newPassword],
        ...Object.entries(hiddens),
      ];
      const res = await this.http.postForm(
        '/Global/account/ChangeUserPassword',
        body,
        outcome.pageUrl,
        { xhr: true, maxRetries: 1 },
      );
      let json: { success?: boolean; error?: string } | null = null;
      try {
        json = JSON.parse(res.text);
      } catch {
        json = null;
      }
      if (!json?.success) {
        throw new Error(`forced password change rejected: ${json?.error ?? res.status}`);
      }
      this.logger.log('login(http): forced password change completed inline');
      await onRotated(newPassword);
      pw = newPassword;
    }
    throw new Error('forced password change loop (portal keeps demanding a change)');
  }

  /**
   * Recover a stale account-level booking request: when the portal keeps
   * handing out a consumed flow token (banners: "appointment request is
   * expired" / qnKM form mismatch), the pending request must be cancelled on
   * myappointments ("Cancel Appointment" menu) so newappointment issues a
   * fresh token. Returns null when there is nothing to cancel (no control on
   * the page), or a safe description of what happened for the events log.
   */
  async cancelStaleBookingRequest(): Promise<string | null> {
    const home = await this.http.get('/Global/appointmentdata/myappointments');
    if (/login/i.test(home.url)) {
      throw new Error('session lost before cancel — re-login and retry');
    }
    const links = [...home.text.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([^<]{0,60})<\/a>/gi)]
      .map((m) => ({ href: m[1]!.trim(), text: m[2]!.trim() }));
    const cancel = links.find((l) => /cancel/i.test(l.href) || /cancel/i.test(l.text))
      // Canonical portal menu target (icon-only link on the appointment
      // pages' side menu; myappointments itself does not carry the menu).
      ?? { href: '/Global/appointmentdata/BLSCancelAppointment', text: 'Cancel Appointment' };
    this.logger.log(`cancel-stale: opening ${cancel.href}`);
    const page = await this.http.get(cancel.href);
    const formHtml = page.text.match(/<form[^>]*>[\s\S]*?<\/form>/i)?.[0] ?? null;
    if (!formHtml) {
      // Some portals cancel via the GET itself (token signed in URL).
      return `cancel link followed (${cancel.href}) — no confirm form, status ${page.status}`;
    }
    const action = formHtml.match(/action="([^"]*)"/i)?.[1] ?? cancel.href;
    const hiddens: Array<[string, string]> = [];
    for (const m of formHtml.matchAll(/<input([^>]*)>/gi)) {
      const type = m[1]!.match(/type\s*=\s*"([^"]*)"/i)?.[1] ?? '';
      const name = m[1]!.match(/name\s*=\s*"([^"]*)"/i)?.[1];
      if (name && (type === 'hidden' || type === 'submit' || type === '')) {
        hiddens.push([name, m[1]!.match(/value\s*=\s*"([^"]*)"/i)?.[1] ?? '']);
      }
    }
    this.logger.log(
      `cancel-stale: confirm form action=${action} fields=${hiddens.map(([k]) => k).join(',')}`,
    );
    const res = await this.http.postForm(action, hiddens, page.url, { maxRetries: 1 });
    return `cancel submitted (${action}) -> ${res.status} ${new URL(res.url).pathname}`;
  }

  // ---------- register ----------
  async fetchRegisterTokens(): Promise<{
    hiddens: Record<string, string>;
    captchaDataUrl: string;
  }> {
    const page = await this.http.get('/Global/Account/RegisterUser');
    const formChunk = page.text.match(/<form[^>]*id="myForm"[\s\S]*?<\/form>/i)?.[0];
    if (!formChunk) throw new Error('register form not found');
    const hiddens: Record<string, string> = {};
    for (const im of formChunk.matchAll(/<input([^>]*type="hidden"[^>]*)>/gi)) {
      const name = readAttr(im[1]!, 'name');
      if (name && name !== '__Invariant') hiddens[name] = readAttr(im[1]!, 'value') ?? '';
    }
    const captchaDataUrl = page.text.match(/GenerateCaptcha\?data=([A-Za-z0-9%+/=_-]+)/)?.[1];
    if (!captchaDataUrl) throw new Error('captcha data param not found');
    return { hiddens, captchaDataUrl };
  }

  async solveRegisterCaptcha(captchaDataUrl: string): Promise<string> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const capPage = await this.http.get(`/Global/CaptchaPublic/GenerateCaptcha?data=${captchaDataUrl}`);
      if (capPage.status !== 200 || !capPage.text.includes('captchaForm')) continue;
      const capHiddens = parseFormHiddens(capPage.text, 'SubmitCaptcha') || {};
      const { picks } = await this.captcha.solve({
        html: capPage.text,
        fetchChallenge: async () =>
          (await this.http.get(`/Global/CaptchaPublic/GenerateCaptcha?data=${captchaDataUrl}`)).text,
      });
      const submit = await this.http.postForm(
        '/Global/CaptchaPublic/SubmitCaptcha',
        [['SelectedImages', picks.join(',')], ...Object.entries(capHiddens)],
        capPage.url,
        // one-shot: the challenge is consumed by the first submission attempt
        { xhr: true, maxRetries: 1 },
      );
      if (submit.status !== 200) continue;
      let json: { success?: boolean; captcha?: string; exceeded?: boolean } | null = null;
      try { json = JSON.parse(submit.text); } catch { json = null; }
      if (json?.exceeded) throw new Error('captcha exceeded');
      if (json?.success && json.captcha) return json.captcha;
    }
    throw new Error('register captcha not solved');
  }

  async fetchGuids(): Promise<{ passportTypeId: string; birthCountryId: string }> {
    const ptRes = await this.http.get('/Global/query/GetLOVIdNameList?lovType=BLS_PASSPORT_TYPE', {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
    const cRes = await this.http.get('/Global/query/GetCountryList', {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
    const pt = JSON.parse(ptRes.text) as Array<{ Id: string; Name: string }>;
    const c = JSON.parse(cRes.text) as Array<{ Id: string; Name: string; Code?: string }>;
    const passportTypeId = pt.find((x) => /ordinary/i.test(x.Name))?.Id;
    const birthCountryId = c.find((x) => /belarus/i.test(x.Name))?.Id;
    if (!passportTypeId || !birthCountryId) throw new Error('dropdown GUIDs not resolved');
    return { passportTypeId, birthCountryId };
  }

  buildRegisterBody(input: {
    hiddens: Record<string, string>;
    captchaData: string;
    passportTypeId: string;
    birthCountryId: string;
    values: {
      surName: string; firstName: string; lastName: string;
      dob: string; passportNumber: string; issueDate: string; expiryDate: string;
      issuePlace: string; mobile: string; email: string;
    };
    emailOtp?: string;
    encryptedEmail?: string;
    encryptedMobile?: string;
    securityCode?: string;
  }): Array<[string, string]> {
    const v = input.values;
    const sc = input.securityCode ?? input.hiddens.SecurityCode ?? '';
    return [
      ['Mode', input.hiddens.Mode ?? 'register'],
      ['CaptchaParam', ''],
      ['CaptchaData', input.captchaData],
      ['CaptchaId', input.hiddens.CaptchaId ?? ''],
      ['ServerDateOfBirth', v.dob],
      ['ServerPassportExpiryDate', v.expiryDate],
      ['ServerPassportIssueDate', v.issueDate],
      ['SecurityCode', sc],
      ['MobileVerificationEnabled', input.hiddens.MobileVerificationEnabled || 'False'],
      ['EncryptedEmail', input.encryptedEmail ?? ''],
      ['EncryptedMobile', input.encryptedMobile ?? ''],
      ['SurName', v.surName],
      ['FirstName', v.firstName],
      ['LastName', v.lastName],
      ['DateOfBirth', v.dob],
      ['__Invariant', 'DateOfBirth'],
      ['PassportType', input.passportTypeId],
      ['BirthCountry', input.birthCountryId],
      ['PassportNumber', v.passportNumber],
      ['PassportIssueDate', v.issueDate],
      ['__Invariant', 'PassportIssueDate'],
      ['PassportExpiryDate', v.expiryDate],
      ['__Invariant', 'PassportExpiryDate'],
      ['IssuePlace', v.issuePlace],
      ['CountryCode', '+375'],
      ['Mobile', v.mobile],
      ['Email', v.email],
      ['EmailOtp', input.emailOtp ?? ''],
      ['__Invariant', 'EmailOtp'],
      ['__RequestVerificationToken', input.hiddens.__RequestVerificationToken ?? ''],
    ];
  }

  // ---------- applicant form (ManageApplicant) ----------
  async fillApplicantForm(editUrl: string, values: Record<string, string>): Promise<boolean> {
    const editPage = await this.http.get(editUrl);
    const formHtml = editPage.text.match(/<form[^>]*>[\s\S]*?<\/form>/i)?.[0];
    if (!formHtml) throw new Error('applicant edit form not found');
    const dataVars: Record<string, Array<{ Id: string; Name: string }>> = {};
    for (const m of editPage.text.matchAll(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g)) {
      try { dataVars[m[1]!] = JSON.parse(m[2]!); } catch { /* skip */ }
    }
    const guidRules: Array<[RegExp, string, RegExp]> = [
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
    const byName = (vn: string, pat: RegExp) => (dataVars[vn] || []).find((d) => pat.test(String(d.Name || '')));
    const action = (formHtml.match(/action="([^"]*)"/i) || [])[1]!;
    let body: Array<[string, string]> | null = null;

    for (let attempt = 1; attempt <= 8; attempt++) {
      if (!body) {
        body = [];
        for (const im of formHtml.matchAll(/<input([^>]*)>/gi)) {
          const tag = im[1]!;
          const name = readAttr(tag, 'name');
          const type = readAttr(tag, 'type');
          if (!name || ['submit', 'button', 'checkbox', 'radio'].includes(type ?? '')) continue;
          let val = readAttr(tag, 'value') ?? '';
          if (name in values) val = values[name]!;
          for (const [rx, vn, pat] of guidRules) if (rx.test(name)) { const h = byName(vn, pat); if (h) val = h.Id; }
          body.push([name, val]);
        }
      }
      const res = await this.http.postForm(action, body, editPage.url, { xhr: true, maxRetries: 1 });
      let json: { success?: boolean; error?: string } | null = null;
      try { json = JSON.parse(res.text); } catch { json = null; }
      if (!json) return false;
      if (json.success) return true;
      const errField = String(json.error || '').match(/Please Enter ([^.]+)/i)?.[1];
      if (!errField) return false;
      const key = errField.toLowerCase().replace(/[^a-z]/g, '').replace(/home|applicant|please|select|the|persons|no/g, '');
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
      const target = body.find(([n]) => norm(n).includes(key) || key.includes(norm(n)))?.[0];
      if (!target) return false;
      let patched = false;
      if (target in values) { body.find(([n]) => n === target)![1] = values[target]!; patched = true; }
      for (const [rx, vn, pat] of guidRules) {
        if (rx.test(target)) { const h = byName(vn, pat); if (h) { body.find(([n]) => n === target)![1] = h.Id; patched = true; } }
      }
      if (!patched) return false;
    }
    return false;
  }

  // ---------- booking walk ----------
  async walkBooking(dropdownPick: { location: RegExp; visaType: RegExp; subType: RegExp; category: RegExp }): Promise<BookingWalkStop> {
    let page = await this.http.get('/Global/appointment/newappointment');
    let reentries = 0;
    const reenter = async () => {
      reentries += 1;
      // A token that dies repeatedly (expired / qnKM form mismatch) means the
      // account-level booking request is stale — it must be cancelled before
      // the portal issues a fresh one.
      if (reentries > 3) {
        return { stale: true as const };
      }
      page = await this.http.get('/Global/appointment/newappointment');
      return { stale: false as const };
    };
    for (let guard = 0; guard < 12; guard++) {
      while (page.status === 429 || page.status >= 500) {
        await new Promise((r) => setTimeout(r, 300000));
        page = await this.http.get(page.url, { maxRetries: 3 });
      }
      const url = new URL(page.url).pathname;
      const text = page.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

      // Auth session expired mid-walk (long 429 waits outlive the ~30-min
      // portal session): the caller re-logins and restarts the walk in-attempt.
      if (/Account\/LogIn/i.test(url)) {
        return { state: 'session_expired' };
      }

      if (/VisaType/i.test(url) || page.text.includes('Visa Type Selection')) {
        page = await this.submitVisaType(page, dropdownPick);
        continue;
      }
      if (/AppointmentCaptcha/i.test(url) || page.text.includes('captchaForm')) {
        const hiddens = parseFormHiddens(page.text, 'appointmentcaptcha') || {};
        const action = (page.text.match(/<form[^>]*action="([^"]*appointmentcaptcha[^"]*)"/i) || [])[1]!;
        const { picks } = await this.captcha.solve({
          html: page.text,
          fetchChallenge: async () => (await this.http.get(page.url)).text,
        });
        // one-shot: consumed challenge — the loop refetches a fresh page
        page = await this.http.postForm(action, [['SelectedImages', picks.join(',')], ...Object.entries(hiddens)], page.url, { maxRetries: 1 });
        continue;
      }
      if (/You have not filled out and completed the applicant detail form/i.test(text)) {
        // qnKM root cause: the applicant form for THIS visa type is incomplete
        // (portal demands it before the booking may proceed). The caller
        // completes the form via ManageApplicant, then rewalks.
        return { state: 'applicant_form_required' };
      }
      if (/Invalid request parameter/i.test(text)) {
        const r = await reenter();
        if (r.stale) return { state: 'stale_booking_request' };
        continue;
      }
      if (/slots are not available/i.test(text)) return { state: 'slots_unavailable' };
      // POC banner map: S7Ls… = "The appointment request is expired" (flow
      // token consumed/expired), qnKM… = form mismatch — both recoverable by
      // re-entering newappointment for a fresh token and rewalking.
      if (/appointment request is expired/i.test(text)) {
        const r = await reenter();
        if (r.stale) return { state: 'stale_booking_request' };
        continue;
      }
      // dp consent is a dedicated /DataProtection page; the NewAppointment
      // page carries a standing dp footer that must NOT be classified as
      // dp_pending (POC guard: URL match + not the slots banner).
      if (/dataprotection/i.test(url) && /data protection information/i.test(text) && !/slots are not available/i.test(text)) {
        return { state: 'dp_pending' };
      }
      if (/SlotSelection/i.test(url)) {
        // rendered calendar (slots available!)
        return { state: 'calendar', html: page.text };
      }
      const banner = text.match(/Book New Appointment\s*-\s*([^.]{5,120})/i)?.[1] ?? null;
      if (/newappointment/i.test(url)) {
        // qnKM "form mismatch" style banners at NewAppointment — the token
        // died on submit; same stale-request recovery path (guard-limited by
        // the reenter counter itself). Log a text excerpt for diagnosis of
        // unclassified page variants (e.g. post-cancel states).
        this.logger.warn(
          `walk: newappointment page unclassified — banner=${banner ?? 'none'} text="${text.slice(0, 220)}"`,
        );
        try {
          const fs = await import('node:fs');
          fs.writeFileSync(
            `/logs/walk-unclassified-${Date.now()}.html`,
            page.text,
          );
        } catch {
          // /logs volume may be unavailable — log excerpt is the fallback
        }
        const r = await reenter();
        if (r.stale) return { state: 'stale_booking_request' };
        continue;
      }
      return { state: 'unknown', html: page.text, url, banner };
    }
    return { state: 'unknown', html: page.text, url: new URL(page.url).pathname };
  }

  private async submitVisaType(
    page: { url: string; text: string },
    pick: { location: RegExp; visaType: RegExp; subType: RegExp; category: RegExp },
  ) {
    const formHtml = page.text.match(/<form[^>]*action="[^"]*Appointment\/VisaType[^"]*"[\s\S]*?<\/form>/i)?.[0];
    if (!formHtml) throw new Error('visa type form not found');
    const ruleMap = buildRuleMap(page.text);
    const realFields: Record<string, string> = {};
    for (const m of page.text.matchAll(/<div class="(mb-3[^"]*)"[^>]*>\s*<label class="form-label" for="([a-z0-9]+)">([^<]*)/gi)) {
      const c = computedStyle(ruleMap, m[1]!.split(/\s+/));
      if ((c.display || '').replace(/\s*!important/, '') === 'block') realFields[m[3]!.trim()] = m[2]!;
    }
    const dataVars: Record<string, Array<{ Id: string; Name: string }>> = {};
    for (const m of page.text.matchAll(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g)) {
      try { dataVars[m[1]!] = JSON.parse(m[2]!); } catch { /* skip */ }
    }
    const opt = (names: string[], pat: RegExp) => {
      for (const vn of names) {
        const hit = (dataVars[vn] || []).find((d) => pat.test(String(d.Name || '')));
        if (hit) return String(hit.Id);
      }
      return '';
    };
    const fieldValues: Record<string, string> = {
      [realFields['Location'] ?? '']: opt(['locationData'], pick.location),
      [realFields['Visa Type'] ?? '']: opt(['visaIdData', 'visaTypeFilterData'], pick.visaType),
      [realFields['Visa Sub Type'] ?? '']: opt(['visasubIdData'], pick.subType),
      [realFields['Category'] ?? '']: opt(['categoryData'], pick.category),
    };
    const sdMatch = page.text.match(/OnSubmitVisaType\(\)\s*\{[\s\S]*?var submittedData\s*=\s*\{([\s\S]*?)\};/i);
    const submittedData: Record<string, string> = {};
    if (sdMatch) {
      for (const ent of sdMatch[1]!.matchAll(/(\w+)\s*:\s*\$\("#(\w+)"\)\.val\(\)/g)) {
        submittedData[ent[1]!] = fieldValues[ent[2]!] ?? '';
      }
    }
    const vtBody: Array<[string, string]> = [];
    const seenRadios = new Set<string>();
    for (const im of formHtml.matchAll(/<input([^>]*)>/gi)) {
      const tag = im[1]!;
      const name = readAttr(tag, 'name');
      const type = readAttr(tag, 'type');
      if (!name) continue;
      if (type === 'radio') {
        const val = readAttr(tag, 'value') ?? '';
        if (/individual/i.test(val) && !seenRadios.has(name)) { vtBody.push([name, val]); seenRadios.add(name); }
        continue;
      }
      if (['submit', 'button'].includes(type ?? '')) continue;
      let val = readAttr(tag, 'value') ?? '';
      if (name === 'ResponseData') val = JSON.stringify(submittedData);
      else if (name in fieldValues) val = fieldValues[name]!;
      vtBody.push([name, val]);
    }
    const action = (formHtml.match(/action="([^"]*)"/i) || [])[1]!;
    const res = await this.http.req('POST', action, {
      data: new URLSearchParams(vtBody).toString(),
      referer: page.url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // one-shot: the flow token is consumed; a 5xx must restart the walk,
      // not repost a stale token (aggressive 429 endpoint — see POC notes).
      maxRetries: 1,
    });
    return res;
  }
}
