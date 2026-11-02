/**
 * Cookie-jar HTTP client for the BLS portal (browserless flow).
 * Global fetch (Node >= 22) — same pattern as the existing CapMonster client.
 * Moderate pacing + 429/5xx backoff + one-shot mode for captcha submits
 * (a 5xx there usually means the captcha was consumed server-side).
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config/types/app-env.types';
import { randomBytes } from 'node:crypto';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

export type PortalHttpResponse = {
  status: number;
  text: string;
  url: string;
  location: string | null;
  setCookies: string[];
};

type ReqOptions = {
  data?: string;
  headers?: Record<string, string>;
  referer?: string;
  maxRetries?: number;
  follow?: boolean;
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

@Injectable()
export class PortalHttpService {
  private readonly logger = new Logger(PortalHttpService.name);
  private readonly pacingMs: number;
  private readonly jar = new Map<string, string>();
  /**
   * Optional sticky residential proxy (template with `{SESSION}` placeholder,
   * e.g. evomi `…_country-BY_session-{SESSION}_lifetime-30m@host:port`).
   * The whole portal session stays on ONE exit IP; the session id rotates
   * (→ new IP) ONLY when a 429 forces a restart. Empty → direct connection.
   */
  private readonly proxyTemplate: string;
  private proxySessionId = randomBytes(6).toString('hex');
  private proxyAgent: ProxyAgent | null = null;

  constructor(private readonly config: ConfigService<AppEnv, true>) {
    this.pacingMs = Number(this.config.get('PORTAL_HTTP_PACING_MS', { infer: true }) ?? 9000);
    this.proxyTemplate = String(
      this.config.get('PORTAL_HTTP_PROXY_TEMPLATE', { infer: true }) ?? '',
    ).trim();
    if (this.proxyTemplate) this.rebuildProxyAgent();
    this.jar.set('visitorId', randomBytes(16).toString('hex'));
  }

  private rebuildProxyAgent(): void {
    this.proxyAgent = new ProxyAgent(
      this.proxyTemplate.replace('{SESSION}', this.proxySessionId),
    );
    this.logger.log(`portal proxy session ${this.proxySessionId}`);
  }

  /** Rotate to a fresh exit IP (called on 429 restarts). */
  rotateProxySession(): void {
    if (!this.proxyTemplate) return;
    this.proxySessionId = randomBytes(6).toString('hex');
    this.rebuildProxyAgent();
  }

  setCookie(name: string, value: string): void {
    this.jar.set(name, value);
  }

  cookieSnapshot(): Record<string, string> {
    return Object.fromEntries(this.jar);
  }

  restoreCookies(snapshot: Record<string, string>): void {
    for (const [k, v] of Object.entries(snapshot)) this.jar.set(k, v);
  }

  private cookieHeader(): string {
    return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async get(url: string, options: ReqOptions = {}): Promise<PortalHttpResponse> {
    return this.req('GET', url, options);
  }

  async postForm(
    url: string,
    body: Array<[string, string]> | Record<string, string>,
    referer?: string,
    options: { xhr?: boolean; maxRetries?: number } = {},
  ): Promise<PortalHttpResponse> {
    return this.req('POST', url, {
      data: new URLSearchParams(body as never).toString(),
      referer,
      maxRetries: options.maxRetries,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: this.baseUrl(),
        ...(options.xhr
          ? { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json, text/javascript, */*; q=0.01' }
          : {}),
      },
    });
  }

  baseUrl(): string {
    return (
      this.config.get('VISES_PORTAL_BASE_URL', { infer: true })?.replace(/\/$/, '') ||
      'https://appointment.blsspainbelarus.by'
    );
  }

  async req(
    method: 'GET' | 'POST',
    url: string,
    options: ReqOptions = {},
  ): Promise<PortalHttpResponse> {
    const fullUrl = url.startsWith('http') ? url : this.baseUrl() + url;
    const maxRetries = options.maxRetries ?? 3;
    let lastRes: PortalHttpResponse | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (attempt > 1) await sleep(15000);
      await sleep(this.pacingMs + Math.random() * 2000);
      const cookieHeader = this.cookieHeader();
      try {
        const res = await undiciFetch(fullUrl, {
          method,
          body: options.data,
          redirect: 'manual',
          dispatcher: this.proxyAgent ?? undefined,
          headers: {
            'User-Agent': UA,
            'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
            'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': options.referer ? 'same-origin' : 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            ...(options.referer ? { Referer: options.referer } : {}),
            ...(options.headers || {}),
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
        });
        const setCookies: string[] = [];
        const rawSetCookie = res.headers.get('set-cookie');
        if (rawSetCookie) {
          // Node fetch joins multiple set-cookie with \n — split robustly
          for (const sc of rawSetCookie.split(/\n(?=[^ ;,]+=)/)) {
            const clean = sc.trim();
            if (!clean) continue;
            setCookies.push(clean);
            const [pair] = clean.split(';');
            const eq = pair.indexOf('=');
            const name = pair.slice(0, eq).trim();
            const value = pair.slice(eq + 1).trim();
            if (name && !(value === '' && name.startsWith('.'))) this.jar.set(name, value);
          }
        }
        const text = await res.text();
        const location = res.headers.get('location');
        lastRes = { status: res.status, text, url: fullUrl, location, setCookies };
        this.logger.debug(`${method} ${new URL(fullUrl).pathname} -> ${res.status}${location ? ` loc=${location.slice(0, 60)}` : ''}`);

        if (res.status === 429 || res.status >= 500) {
          if (res.status === 429) {
            // 429 = this exit IP is spent: rotate the sticky proxy session
            // (new IP) instead of waiting out the window on the same address.
            this.rotateProxySession();
          }
          if (attempt >= maxRetries) return lastRes;
          const waitMs = res.status === 429 ? 120000 * attempt : 90000 * attempt;
          this.logger.warn(`${res.status} portal flaky — waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${maxRetries})`);
          await sleep(waitMs);
          continue;
        }
        if (options.follow !== false && [301, 302, 303, 307].includes(res.status) && location) {
          const next = location.startsWith('http') ? location : this.baseUrl() + location;
          return this.req('GET', next, { headers: options.headers, referer: fullUrl, maxRetries });
        }
        return lastRes;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`network error: ${msg} (attempt ${attempt}/${maxRetries})`);
        if (attempt >= maxRetries) throw e;
        await sleep(20000 * attempt);
      }
    }
    if (lastRes) return lastRes;
    throw new Error('portal http: retries exhausted');
  }
}
