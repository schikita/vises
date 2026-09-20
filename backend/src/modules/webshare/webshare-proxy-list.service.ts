import { Injectable, Logger } from '@nestjs/common';
import {
  WEBSHARE_PROXY_LIST_429_BACKOFF_MS,
  WEBSHARE_PROXY_LIST_429_MAX_RETRIES,
  WEBSHARE_PROXY_LIST_BASE_URL,
  WEBSHARE_PROXY_LIST_MAX_PAGES,
  WEBSHARE_PROXY_LIST_PAGE_SIZE,
  WEBSHARE_PROXY_MSG_AUTH,
  WEBSHARE_PROXY_MSG_LIST_FAILED,
  WEBSHARE_PROXY_MSG_MISCONFIGURED,
  WEBSHARE_PROXY_MSG_RATE_LIMITED,
} from './constants';
import type { IProxyList } from './interfaces';
import type {
  UsableWebshareProxy,
  WebshareProxyListRow,
  WebshareProxyRuntimeConfig,
} from './types';
import { createWebshareProxyError } from './utils/create-webshare-proxy-error.util';
import { maskProxyAddress } from './utils/mask-proxy-address.util';
import { toUsableWebshareProxy } from './utils/to-usable-webshare-proxy.util';
import { webshareListSleep } from './utils/webshare-list-sleep.util';

/**
 * Webshare Proxy List client with in-memory TTL cache (DEC-007).
 * CapMonster / other Nest egress is unaffected (DEC-005 / CON-006).
 */
@Injectable()
export class WebshareProxyListService implements IProxyList {
  private readonly logger = new Logger(WebshareProxyListService.name);

  private cachedProxies = new Map<string, UsableWebshareProxy>();
  private cacheFetchedAtMs = 0;
  private cacheMode: string | undefined;
  private cachePlanId: string | undefined;
  private cacheApiKeyFingerprint: string | undefined;

  /**
   * Return usable proxies from cache, refreshing when stale, empty, forced,
   * or when mode/plan/key identity changed.
   */
  async getUsableProxies(
    config: WebshareProxyRuntimeConfig,
    forceRefresh = false,
  ): Promise<Map<string, UsableWebshareProxy>> {
    const mode = config.webshareProxyMode;
    const apiKey = config.webshareApiKey?.trim() ?? '';
    if (!apiKey) {
      throw createWebshareProxyError(
        'misconfigured',
        WEBSHARE_PROXY_MSG_MISCONFIGURED,
      );
    }

    const now = Date.now();
    const stale =
      now - this.cacheFetchedAtMs > config.webshareListTtlMs ||
      this.cacheMode !== mode ||
      this.cachePlanId !== (config.websharePlanId ?? '') ||
      this.cacheApiKeyFingerprint !== this.fingerprintKey(apiKey);

    const needRefresh =
      forceRefresh || stale || this.cachedProxies.size === 0;

    if (needRefresh) {
      await this.refresh(config, apiKey, mode);
    }

    return this.cachedProxies;
  }

  /** Current cache snapshot (may be empty / stale); for lease free-count checks. */
  getCachedProxies(): Map<string, UsableWebshareProxy> {
    return this.cachedProxies;
  }

  getCacheFetchedAtMs(): number {
    return this.cacheFetchedAtMs;
  }

  private fingerprintKey(apiKey: string): string {
    // Non-secret fingerprint for cache identity only (length + first/last char).
    if (apiKey.length < 2) return `${apiKey.length}`;
    return `${apiKey.length}:${apiKey[0]}:${apiKey[apiKey.length - 1]}`;
  }

  private async refresh(
    config: WebshareProxyRuntimeConfig,
    apiKey: string,
    mode: 'direct' | 'backbone',
  ): Promise<void> {
    const usable = new Map<string, UsableWebshareProxy>();
    let page = 1;
    let nextUrl: string | null = this.buildFirstPageUrl(config, mode);

    while (nextUrl && page <= WEBSHARE_PROXY_LIST_MAX_PAGES) {
      const payload = await this.fetchListPage(nextUrl, apiKey);
      const rows = Array.isArray(payload.results) ? payload.results : [];
      for (const row of rows) {
        const mapped = toUsableWebshareProxy(
          row as WebshareProxyListRow,
          mode,
        );
        if (mapped) usable.set(mapped.id, mapped);
      }
      nextUrl =
        typeof payload.next === 'string' && payload.next.trim().length > 0
          ? payload.next.trim()
          : null;
      page += 1;
    }

    this.cachedProxies = usable;
    this.cacheFetchedAtMs = Date.now();
    this.cacheMode = mode;
    this.cachePlanId = config.websharePlanId ?? '';
    this.cacheApiKeyFingerprint = this.fingerprintKey(apiKey);

    const sample = [...usable.values()].slice(0, 3).map((p) => ({
      id: p.id,
      address: maskProxyAddress(p.proxyAddress),
      country: p.countryCode,
    }));
    this.logger.log(
      `Webshare list refreshed mode=${mode} usable=${usable.size} sample=${JSON.stringify(sample)}`,
    );
  }

  private buildFirstPageUrl(
    config: WebshareProxyRuntimeConfig,
    mode: 'direct' | 'backbone',
  ): string {
    const url = new URL(WEBSHARE_PROXY_LIST_BASE_URL);
    url.searchParams.set('mode', mode);
    url.searchParams.set('page', '1');
    url.searchParams.set('page_size', String(WEBSHARE_PROXY_LIST_PAGE_SIZE));
    if (mode === 'direct') {
      url.searchParams.set('valid', 'true');
    }
    if (config.websharePlanId) {
      url.searchParams.set('plan_id', config.websharePlanId);
    }
    return url.toString();
  }

  private async fetchListPage(
    url: string,
    apiKey: string,
  ): Promise<{ results?: unknown[]; next?: string | null }> {
    let attempt = 0;
    while (true) {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        throw createWebshareProxyError('auth', WEBSHARE_PROXY_MSG_AUTH);
      }

      if (res.status === 429) {
        if (attempt >= WEBSHARE_PROXY_LIST_429_MAX_RETRIES) {
          throw createWebshareProxyError(
            'rate_limited',
            WEBSHARE_PROXY_MSG_RATE_LIMITED,
          );
        }
        this.logger.warn(
          `Webshare list HTTP 429; backing off ${WEBSHARE_PROXY_LIST_429_BACKOFF_MS}ms (attempt ${attempt + 1})`,
        );
        await webshareListSleep(WEBSHARE_PROXY_LIST_429_BACKOFF_MS);
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        throw createWebshareProxyError(
          'list_failed',
          `${WEBSHARE_PROXY_MSG_LIST_FAILED} (HTTP ${res.status})`,
        );
      }

      try {
        return (await res.json()) as {
          results?: unknown[];
          next?: string | null;
        };
      } catch {
        throw createWebshareProxyError(
          'list_failed',
          WEBSHARE_PROXY_MSG_LIST_FAILED,
        );
      }
    }
  }
}
