import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { AppEnv } from '../config';
import {
  PROXY6_429_BACKOFF_MS,
  PROXY6_429_MAX_ATTEMPTS,
  PROXY6_DEFAULT_TYPE,
  PROXY6_DEFAULT_VERSION,
  PROXY6_MIN_REQUEST_SPACING_MS,
  PROXY6_MSG_MISCONFIGURED,
  PROXY6_MSG_RATE_LIMITED,
  PROXY6_MSG_REQUEST_FAILED,
} from './constants';
import type {
  Proxy6ApiMethod,
  Proxy6BalanceResponse,
  Proxy6BuyParams,
  Proxy6BuyResponse,
  Proxy6CheckParams,
  Proxy6CheckResponse,
  Proxy6DeleteParams,
  Proxy6DeleteResponse,
  Proxy6GetCountParams,
  Proxy6GetCountResponse,
  Proxy6GetCountryParams,
  Proxy6GetCountryResponse,
  Proxy6GetPriceParams,
  Proxy6GetPriceResponse,
  Proxy6GetProxyParams,
  Proxy6GetProxyResponse,
  Proxy6ProlongParams,
  Proxy6ProlongResponse,
  Proxy6QueryParams,
  Proxy6SetDescrParams,
  Proxy6SetDescrResponse,
} from './types';
import { buildProxy6ApiUrl } from './utils/build-proxy6-api-url.util';
import { compactProxy6Params } from './utils/compact-proxy6-params.util';
import { createProxy6ApiError } from './utils/create-proxy6-api-error.util';
import { isProxy6ApiError } from './utils/is-proxy6-api-error.util';
import { joinProxy6Ids } from './utils/join-proxy6-ids.util';
import { mapProxy6ErrorId } from './utils/map-proxy6-error-id.util';
import { proxy6Sleep } from './utils/proxy6-sleep.util';

/**
 * Proxy6 HTTP client via Nest HttpModule / axios (DEC-008).
 * Serializes calls with ~350 ms spacing; retries HTTP 429 with bounded backoff.
 * Never logs API key or proxy passwords.
 */
@Injectable()
export class Proxy6ApiService {
  private readonly logger = new Logger(Proxy6ApiService.name);
  private lastCallAtMs = 0;
  private callChain: Promise<void> = Promise.resolve();

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  /** Account balance via key-only endpoint (no method segment). */
  async getBalance(): Promise<Proxy6BalanceResponse> {
    return this.callMethod<Proxy6BalanceResponse>('');
  }

  async getProxy(
    params: Proxy6GetProxyParams = {},
  ): Promise<Proxy6GetProxyResponse> {
    return this.callMethod<Proxy6GetProxyResponse>(
      'getproxy',
      compactProxy6Params({
        state: params.state,
        descr: params.descr,
        nokey: params.nokey,
        page: params.page,
        limit: params.limit,
      }),
    );
  }

  async getPrice(
    params: Proxy6GetPriceParams = {},
  ): Promise<Proxy6GetPriceResponse> {
    return this.callMethod<Proxy6GetPriceResponse>(
      'getprice',
      compactProxy6Params({
        count: params.count,
        period: params.period,
        version: params.version ?? PROXY6_DEFAULT_VERSION,
      }),
    );
  }

  async getCount(
    params: Proxy6GetCountParams,
  ): Promise<Proxy6GetCountResponse> {
    return this.callMethod<Proxy6GetCountResponse>(
      'getcount',
      compactProxy6Params({
        country: params.country,
        version: params.version ?? PROXY6_DEFAULT_VERSION,
      }),
    );
  }

  async getCountry(
    params: Proxy6GetCountryParams = {},
  ): Promise<Proxy6GetCountryResponse> {
    return this.callMethod<Proxy6GetCountryResponse>(
      'getcountry',
      compactProxy6Params({
        version: params.version ?? PROXY6_DEFAULT_VERSION,
      }),
    );
  }

  async buy(params: Proxy6BuyParams): Promise<Proxy6BuyResponse> {
    return this.callMethod<Proxy6BuyResponse>(
      'buy',
      compactProxy6Params({
        count: params.count,
        period: params.period,
        country: params.country,
        version: params.version ?? PROXY6_DEFAULT_VERSION,
        type: params.type ?? PROXY6_DEFAULT_TYPE,
        descr: params.descr,
        auto_prolong: params.autoProlong,
        nokey: params.nokey,
      }),
    );
  }

  async prolong(params: Proxy6ProlongParams): Promise<Proxy6ProlongResponse> {
    return this.callMethod<Proxy6ProlongResponse>(
      'prolong',
      compactProxy6Params({
        period: params.period,
        ids: joinProxy6Ids(params.ids),
        nokey: params.nokey,
      }),
    );
  }

  /**
   * Delete proxies. Tries method `delete` first; on error_id 110 retries as
   * `deleted` (DEC-008 / RISK-007).
   */
  async delete(params: Proxy6DeleteParams): Promise<Proxy6DeleteResponse> {
    const query = compactProxy6Params({
      ids: params.ids ? joinProxy6Ids(params.ids) : undefined,
      descr: params.descr,
    });
    try {
      return await this.callMethod<Proxy6DeleteResponse>('delete', query);
    } catch (err) {
      if (isProxy6ApiError(err) && err.errorId === 110) {
        this.logger.warn(
          'Proxy6 method "delete" rejected (error_id 110); retrying as "deleted"',
        );
        return this.callMethod<Proxy6DeleteResponse>('deleted', query);
      }
      throw err;
    }
  }

  async check(params: Proxy6CheckParams): Promise<Proxy6CheckResponse> {
    return this.callMethod<Proxy6CheckResponse>(
      'check',
      compactProxy6Params({
        ids: params.ids,
        proxy: params.proxy,
      }),
    );
  }

  async setDescr(
    params: Proxy6SetDescrParams,
  ): Promise<Proxy6SetDescrResponse> {
    return this.callMethod<Proxy6SetDescrResponse>(
      'setdescr',
      compactProxy6Params({
        new: params.new,
        old: params.old,
        ids: params.ids ? joinProxy6Ids(params.ids) : undefined,
      }),
    );
  }

  private resolveApiKey(): string {
    const key = this.config.get('PROXY6_API_KEY', { infer: true }).trim();
    if (!key) {
      throw createProxy6ApiError({
        code: 'misconfigured',
        message: PROXY6_MSG_MISCONFIGURED,
      });
    }
    return key;
  }

  private async callMethod<T>(
    method: Proxy6ApiMethod | '',
    params?: Proxy6QueryParams,
  ): Promise<T> {
    return this.enqueue(() => this.callMethodInner<T>(method, params));
  }

  /**
   * Serialize outbound Proxy6 HTTP so spacing + 429 retries stay ≤3 req/s.
   */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.callChain.then(async () => {
      const elapsed = Date.now() - this.lastCallAtMs;
      if (elapsed < PROXY6_MIN_REQUEST_SPACING_MS) {
        await proxy6Sleep(PROXY6_MIN_REQUEST_SPACING_MS - elapsed);
      }
      try {
        return await fn();
      } finally {
        this.lastCallAtMs = Date.now();
      }
    });
    this.callChain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async callMethodInner<T>(
    method: Proxy6ApiMethod | '',
    params?: Proxy6QueryParams,
  ): Promise<T> {
    const apiKey = this.resolveApiKey();
    const url = buildProxy6ApiUrl({
      apiKey,
      method,
      params,
    });

    for (let attempt = 0; attempt < PROXY6_429_MAX_ATTEMPTS; attempt += 1) {
      let status: number;
      let data: unknown;
      try {
        const response = await firstValueFrom(
          this.http.request<unknown>({
            method: 'GET',
            url,
            headers: { Accept: 'application/json' },
            timeout: 30_000,
            validateStatus: () => true,
            transitional: { clarifyTimeoutError: true },
          }),
        );
        status = response.status;
        data = response.data;
      } catch (err) {
        if (err instanceof AxiosError) {
          throw createProxy6ApiError({
            code: 'request_failed',
            message: PROXY6_MSG_REQUEST_FAILED,
            httpStatus: err.response?.status,
          });
        }
        throw createProxy6ApiError({
          code: 'request_failed',
          message: PROXY6_MSG_REQUEST_FAILED,
        });
      }

      if (status === 429) {
        if (attempt >= PROXY6_429_MAX_ATTEMPTS - 1) {
          throw createProxy6ApiError({
            code: 'rate_limited',
            message: PROXY6_MSG_RATE_LIMITED,
            httpStatus: 429,
          });
        }
        const backoffMs = PROXY6_429_BACKOFF_MS[attempt] ?? 1600;
        this.logger.warn(
          `Proxy6 HTTP 429; backing off ${backoffMs}ms (attempt ${attempt + 1})`,
        );
        await proxy6Sleep(backoffMs);
        continue;
      }

      if (status < 200 || status >= 300) {
        throw createProxy6ApiError({
          code: 'request_failed',
          message: PROXY6_MSG_REQUEST_FAILED,
          httpStatus: status,
        });
      }

      return this.parseEnvelope<T>(data);
    }

    throw createProxy6ApiError({
      code: 'rate_limited',
      message: PROXY6_MSG_RATE_LIMITED,
      httpStatus: 429,
    });
  }

  private parseEnvelope<T>(data: unknown): T {
    if (!data || typeof data !== 'object') {
      throw createProxy6ApiError({
        code: 'request_failed',
        message: PROXY6_MSG_REQUEST_FAILED,
      });
    }
    const body = data as Record<string, unknown>;
    const status = body.status;
    if (status === 'no') {
      const rawId = body.error_id;
      const errorId =
        typeof rawId === 'number'
          ? rawId
          : typeof rawId === 'string' && rawId.trim() !== ''
            ? Number(rawId)
            : undefined;
      const mapped = mapProxy6ErrorId(
        Number.isFinite(errorId) ? errorId : undefined,
      );
      throw createProxy6ApiError({
        code: mapped.code,
        message: mapped.message,
        errorId: Number.isFinite(errorId) ? errorId : undefined,
      });
    }
    if (status !== 'yes') {
      throw createProxy6ApiError({
        code: 'request_failed',
        message: PROXY6_MSG_REQUEST_FAILED,
      });
    }
    return data as T;
  }
}
