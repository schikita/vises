import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { AppEnv } from '../config';
import {
  MAILTM_ACCOUNTS_PATH,
  MAILTM_DOMAINS_PATH,
  MAILTM_ME_PATH,
  MAILTM_MESSAGES_PATH,
  MAILTM_POLL_INTERVAL_MS,
  MAILTM_TOKEN_PATH,
  MAILTM_WAIT_FOR_EMAIL_MS,
} from './constants';
import type { TemporaryEmailProvider } from './interfaces';
import type {
  CreateTemporaryMailboxInput,
  DeleteTemporaryMailboxInput,
  DeleteTemporaryMailboxResult,
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
  FetchMailTmJsonInput,
  FetchMailTmJsonResult,
  LoginMailTmAccountInput,
  MailTmFailureClassifyInput,
  MailTmHydraCollection,
  MailTmMessageDetail,
  MailTmMessagesCollection,
  ResolveMailTmAccountResult,
  TemporaryEmailCallOptions,
  TemporaryMailboxAccount,
  WaitTemporaryEmailMessageInput,
  WaitTemporaryEmailMessageResult,
} from './types';
import { assertMailTmCircuitAllowsCall } from './utils/assert-mailtm-circuit-allows-call.util';
import { classifyMailTmFailure } from './utils/classify-mailtm-failure.util';
import { combineMailTmMessageBody } from './utils/combine-mailtm-message-body.util';
import { computeMailTmBackoffMs } from './utils/compute-mailtm-backoff-ms.util';
import { createMailTmClientError } from './utils/create-mailtm-client-error.util';
import { extractMailTmOtp } from './utils/extract-mailtm-otp.util';
import { extractMailTmPortalPassword } from './utils/extract-mailtm-portal-password.util';
import { formatMailTmError } from './utils/format-mailtm-error.util';
import { generateMailTmLocalPart } from './utils/generate-mailtm-local-part.util';
import { generateMailTmPassword } from './utils/generate-mailtm-password.util';
import { mailTmSleep } from './utils/mailtm-sleep.util';
import { pickMailTmDomain } from './utils/pick-mailtm-domain.util';
import { pickMailTmNewestMessage } from './utils/pick-mailtm-newest-message.util';

/**
 * Mail.tm TemporaryEmailProvider adapter (HttpModule / axios).
 * Attribution: https://mail.tm
 * Protected create/wait accept optional run-scoped CB (DEC-002); delete is exempt.
 * Callers retain after OTP success and vault password/token (REQ-016 / DEC-007).
 */
@Injectable()
export class MailTmService implements TemporaryEmailProvider {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  /**
   * Create a Mail.tm account and obtain a Bearer token.
   * Returns password on the handle for vault retain only — never log it.
   * `input.contextKey` is accepted for port uniformity (ignored for HTTP).
   * When `options.circuit` is set, asserts the breaker before any HTTP.
   */
  async createAccount(
    input: CreateTemporaryMailboxInput,
    options?: TemporaryEmailCallOptions,
  ): Promise<TemporaryMailboxAccount> {
    void input.contextKey;
    if (options?.circuit) {
      assertMailTmCircuitAllowsCall(options.circuit, Date.now());
    }

    const budgetMs = MAILTM_WAIT_FOR_EMAIL_MS;
    const started = Date.now();
    const remaining = () => Math.max(0, budgetMs - (Date.now() - started));

    const domainsRes = await this.requestJson({
      method: 'GET',
      path: MAILTM_DOMAINS_PATH,
      remainingMs: remaining(),
    });
    if (!domainsRes.ok) {
      this.throwClassified(
        'domains',
        { source: 'http_status', httpStatus: domainsRes.status },
        `HTTP ${domainsRes.status}`,
      );
    }
    const collection = domainsRes.data as MailTmHydraCollection | undefined;
    let domain: string;
    try {
      domain = pickMailTmDomain(collection?.['hydra:member']);
    } catch (err) {
      this.throwClassified(
        'domains',
        { source: 'validation' },
        err instanceof Error ? err.message : 'invalid domain list',
      );
    }

    const localPart = generateMailTmLocalPart();
    const address = `${localPart}@${domain}`.toLowerCase();
    const password = generateMailTmPassword();
    const redactSecrets = [password];

    const accountRes = await this.requestJson({
      method: 'POST',
      path: MAILTM_ACCOUNTS_PATH,
      body: { address, password },
      remainingMs: remaining(),
      redactSecrets,
    });
    if (!accountRes.ok) {
      this.throwClassified(
        'accounts',
        { source: 'http_status', httpStatus: accountRes.status },
        `HTTP ${accountRes.status}`,
        redactSecrets,
      );
    }
    const accountBody = accountRes.data as
      | { id?: string; address?: string }
      | undefined;
    const id = accountBody?.id?.trim() ?? '';
    const createdAddress = (
      accountBody?.address?.trim() || address
    ).toLowerCase();
    if (!id) {
      this.throwClassified(
        'accounts',
        { source: 'validation' },
        'create returned empty account id',
        redactSecrets,
      );
    }

    const tokenRes = await this.requestJson({
      method: 'POST',
      path: MAILTM_TOKEN_PATH,
      body: { address: createdAddress, password },
      remainingMs: remaining(),
      redactSecrets,
    });
    if (!tokenRes.ok) {
      this.throwClassified(
        'token',
        { source: 'http_status', httpStatus: tokenRes.status },
        `HTTP ${tokenRes.status}`,
        redactSecrets,
      );
    }
    const tokenBody = tokenRes.data as
      | { token?: string; id?: string }
      | undefined;
    const token = tokenBody?.token?.trim() ?? '';
    if (!token) {
      this.throwClassified(
        'token',
        { source: 'validation' },
        'token response missing Bearer token',
        redactSecrets,
      );
    }

    return {
      id,
      address: createdAddress,
      token,
      password,
    };
  }

  /**
   * Poll Mail.tm for the newest (prefer unread) message within budget.
   * On HTTP 429: backoff within remaining budget; never busy-spin; do not
   * per-tick record against CB (DEC-005). Whole-call timeout → wait_timeout.
   * When `options.circuit` is set, asserts the breaker before polling.
   */
  async waitLatestMessage(
    input: WaitTemporaryEmailMessageInput,
    options?: TemporaryEmailCallOptions,
  ): Promise<WaitTemporaryEmailMessageResult> {
    void input.contextKey;
    if (options?.circuit) {
      assertMailTmCircuitAllowsCall(options.circuit, Date.now());
    }

    if (input.timeoutMs <= 0) {
      this.throwClassified(
        'wait messages',
        { source: 'wait_timeout' },
        'timeout budget exhausted',
        [input.token],
      );
    }

    const started = Date.now();
    const unreadOnly = input.unreadOnly !== false;
    const redactSecrets = [input.token];
    let rateLimitAttempt = 0;

    while (Date.now() - started < input.timeoutMs) {
      const remainingMs = Math.max(0, input.timeoutMs - (Date.now() - started));
      if (remainingMs <= 0) {
        break;
      }

      const listRes = await this.requestJson({
        method: 'GET',
        path: MAILTM_MESSAGES_PATH,
        token: input.token,
        remainingMs,
        redactSecrets,
      });

      if (listRes.status === 429) {
        const sleepMs = Math.min(
          remainingMs,
          computeMailTmBackoffMs(rateLimitAttempt, listRes.retryAfterSeconds),
        );
        rateLimitAttempt += 1;
        if (sleepMs <= 0) {
          break;
        }
        await mailTmSleep(sleepMs);
        continue;
      }

      if (!listRes.ok) {
        this.throwClassified(
          'messages',
          { source: 'http_status', httpStatus: listRes.status },
          `HTTP ${listRes.status}`,
          redactSecrets,
        );
      }

      rateLimitAttempt = 0;
      const collection = listRes.data as MailTmMessagesCollection | undefined;
      const members = collection?.['hydra:member'] ?? [];
      const excludeIds = new Set(
        (input.excludeMessageIds ?? [])
          .map((id) => id.trim())
          .filter((id) => id.length > 0),
      );
      const eligible =
        excludeIds.size === 0
          ? members
          : members.filter((m) => {
              const id = m.id?.trim() ?? '';
              return id.length === 0 || !excludeIds.has(id);
            });
      const picked = pickMailTmNewestMessage(eligible, unreadOnly);
      const messageId = picked?.id?.trim() ?? '';

      if (messageId) {
        const detailRemaining = Math.max(
          0,
          input.timeoutMs - (Date.now() - started),
        );
        const detailRes = await this.requestJson({
          method: 'GET',
          path: `${MAILTM_MESSAGES_PATH}/${encodeURIComponent(messageId)}`,
          token: input.token,
          remainingMs: detailRemaining,
          redactSecrets,
        });

        if (detailRes.status === 429) {
          const sleepMs = Math.min(
            detailRemaining,
            computeMailTmBackoffMs(
              rateLimitAttempt,
              detailRes.retryAfterSeconds,
            ),
          );
          rateLimitAttempt += 1;
          if (sleepMs <= 0) {
            break;
          }
          await mailTmSleep(sleepMs);
          continue;
        }

        if (!detailRes.ok) {
          this.throwClassified(
            'message detail',
            { source: 'http_status', httpStatus: detailRes.status },
            `HTTP ${detailRes.status}`,
            redactSecrets,
          );
        }

        const detail = (detailRes.data ?? {}) as MailTmMessageDetail;
        return {
          messageId,
          body: combineMailTmMessageBody(detail),
        };
      }

      const sleepMs = Math.min(
        MAILTM_POLL_INTERVAL_MS,
        Math.max(0, input.timeoutMs - (Date.now() - started)),
      );
      if (sleepMs <= 0) {
        break;
      }
      await mailTmSleep(sleepMs);
    }

    this.throwClassified(
      'wait messages',
      { source: 'wait_timeout' },
      `no message within ${input.timeoutMs}ms`,
      redactSecrets,
    );
  }

  extractOtp(
    input: ExtractTemporaryEmailOtpInput,
  ): ExtractTemporaryEmailOtpResult {
    return extractMailTmOtp(input);
  }

  extractPortalPassword(
    input: ExtractTemporaryEmailPortalPasswordInput,
  ): ExtractTemporaryEmailPortalPasswordResult {
    return extractMailTmPortalPassword(input);
  }

  /**
   * Soft-fail re-auth for terminal cleanup (REQ-016).
   * Returns account id + Bearer token. Never throws; never logs secrets.
   * Not gated by CB (same exemption as delete).
   */
  async loginAccount(
    input: LoginMailTmAccountInput,
  ): Promise<ResolveMailTmAccountResult> {
    const address = input.address.trim().toLowerCase();
    const password = input.password.trim();
    if (!address || !password) {
      return {
        ok: false,
        warnMessage: formatMailTmError(
          'login account',
          new Error('missing address or password'),
        ),
      };
    }
    const redactSecrets = [password];
    try {
      const tokenRes = await this.requestJson({
        method: 'POST',
        path: MAILTM_TOKEN_PATH,
        body: { address, password },
        remainingMs: 30_000,
        redactSecrets,
      });
      if (!tokenRes.ok) {
        return {
          ok: false,
          warnMessage: formatMailTmError(
            'login account',
            new Error(`HTTP ${tokenRes.status}`),
            redactSecrets,
          ),
        };
      }
      const tokenBody = tokenRes.data as
        | { token?: string; id?: string }
        | undefined;
      const token = tokenBody?.token?.trim() ?? '';
      const accountId = tokenBody?.id?.trim() ?? '';
      if (!token || !accountId) {
        return {
          ok: false,
          warnMessage: formatMailTmError(
            'login account',
            new Error('token response missing id or token'),
            redactSecrets,
          ),
        };
      }
      return { ok: true, accountId, token };
    } catch (err) {
      return {
        ok: false,
        warnMessage: formatMailTmError('login account', err, redactSecrets),
      };
    }
  }

  /**
   * Soft-fail GET /me to resolve account id from a vaulted Bearer token.
   * Never throws; never includes token in warnMessage.
   */
  async resolveAccountIdFromToken(
    token: string,
  ): Promise<ResolveMailTmAccountResult> {
    const trimmed = token.trim();
    if (!trimmed) {
      return {
        ok: false,
        warnMessage: formatMailTmError(
          'resolve account',
          new Error('missing token'),
        ),
      };
    }
    const redactSecrets = [trimmed];
    try {
      const res = await this.requestJson({
        method: 'GET',
        path: MAILTM_ME_PATH,
        token: trimmed,
        remainingMs: 30_000,
        redactSecrets,
      });
      if (!res.ok) {
        return {
          ok: false,
          warnMessage: formatMailTmError(
            'resolve account',
            new Error(`HTTP ${res.status}`),
            redactSecrets,
          ),
        };
      }
      const body = res.data as { id?: string } | undefined;
      const accountId = body?.id?.trim() ?? '';
      if (!accountId) {
        return {
          ok: false,
          warnMessage: formatMailTmError(
            'resolve account',
            new Error('me response missing account id'),
            redactSecrets,
          ),
        };
      }
      return { ok: true, accountId, token: trimmed };
    } catch (err) {
      return {
        ok: false,
        warnMessage: formatMailTmError('resolve account', err, redactSecrets),
      };
    }
  }

  /**
   * Best-effort Mail.tm account delete after a run.
   * Never throws; soft-fail message must not include the Bearer token.
   * Not gated by open CB; delete failures do not open CB (DEC-010).
   * Resolves accountId via /me or login when only token / address+password
   * are supplied (terminal cleanup path).
   * `input.contextKey` accepted for port uniformity (ignored for HTTP).
   */
  async deleteAccount(
    input: DeleteTemporaryMailboxInput,
  ): Promise<DeleteTemporaryMailboxResult> {
    void input.contextKey;

    let accountId = input.accountId?.trim() ?? '';
    let token = input.token?.trim() ?? '';

    if (token && !accountId) {
      const fromMe = await this.resolveAccountIdFromToken(token);
      if (fromMe.ok) {
        accountId = fromMe.accountId;
        token = fromMe.token;
      }
    }

    if ((!accountId || !token) && input.address && input.password) {
      const login = await this.loginAccount({
        address: input.address,
        password: input.password,
      });
      if (!login.ok) {
        return { ok: false, warnMessage: login.warnMessage };
      }
      accountId = login.accountId;
      token = login.token;
    }

    if (!accountId || !token) {
      return {
        ok: false,
        warnMessage: formatMailTmError(
          'delete account',
          new Error('missing account id or token'),
        ),
      };
    }

    try {
      const res = await this.requestJson({
        method: 'DELETE',
        path: `${MAILTM_ACCOUNTS_PATH}/${encodeURIComponent(accountId)}`,
        token,
        remainingMs: 30_000,
        redactSecrets: [token],
      });
      if (!res.ok && res.status !== 204) {
        return {
          ok: false,
          warnMessage: formatMailTmError(
            'delete account',
            new Error(`HTTP ${res.status}`),
            [token],
          ),
        };
      }
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        warnMessage: formatMailTmError('delete account', err, [token]),
      };
    }
  }

  /**
   * HTTP adapter has no browser session — soft no-op success (DEC-013).
   */
  async disposeSession(
    contextKey: string,
  ): Promise<DeleteTemporaryMailboxResult> {
    void contextKey;
    return { ok: true };
  }

  private throwClassified(
    phase: string,
    classifyInput: MailTmFailureClassifyInput,
    detail: string,
    redactSecrets?: string[],
  ): never {
    throw createMailTmClientError({
      message: formatMailTmError(phase, new Error(detail), redactSecrets),
      failureClass: classifyMailTmFailure(classifyInput),
      phase,
      httpStatus:
        classifyInput.source === 'http_status'
          ? classifyInput.httpStatus
          : undefined,
    });
  }

  private resolveBaseUrl(): string {
    const base = this.config
      .get('MAILTM_API_BASE_URL', { infer: true })
      .trim()
      .replace(/\/+$/, '');
    if (!base) {
      this.throwClassified(
        'config',
        { source: 'validation' },
        'MAILTM_API_BASE_URL is empty',
      );
    }
    return base;
  }

  /**
   * Axios request via Nest HttpService. Does not throw on HTTP 4xx/5xx;
   * callers decide. Network/timeout errors throw classified client errors.
   */
  private async requestJson(
    input: FetchMailTmJsonInput,
  ): Promise<FetchMailTmJsonResult> {
    if (input.remainingMs <= 0) {
      this.throwClassified(
        input.path,
        { source: 'transport', reason: 'timeout_budget' },
        'request aborted: timeout budget exhausted',
        input.redactSecrets,
      );
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (input.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    const token = input.token?.trim();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${this.resolveBaseUrl()}${input.path}`;

    try {
      const response = await firstValueFrom(
        this.http.request<unknown>({
          method: input.method,
          url,
          headers,
          data: input.body,
          timeout: input.remainingMs,
          validateStatus: () => true,
          transitional: { clarifyTimeoutError: true },
        }),
      );

      const retryAfterRaw = response.headers?.['retry-after'];
      let retryAfterSeconds: number | undefined;
      if (retryAfterRaw !== undefined && retryAfterRaw !== null) {
        const asNum = Number(retryAfterRaw);
        if (Number.isFinite(asNum) && asNum > 0) {
          retryAfterSeconds = asNum;
        }
      }

      const status = response.status;
      return {
        status,
        ok: status >= 200 && status < 300,
        data: response.data,
        retryAfterSeconds,
      };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
          this.throwClassified(
            input.path,
            { source: 'transport', reason: 'timeout_budget' },
            'timed out',
            input.redactSecrets,
          );
        }
        this.throwClassified(
          input.path,
          { source: 'transport', reason: 'network' },
          err.message || 'network error',
          input.redactSecrets,
        );
      }
      this.throwClassified(
        input.path,
        { source: 'unknown' },
        err instanceof Error ? err.message : 'unknown request error',
        input.redactSecrets,
      );
    }
  }
}
