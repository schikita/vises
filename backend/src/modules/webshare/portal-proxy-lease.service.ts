import { Injectable, Logger } from '@nestjs/common';
import { uid } from '../../shared/utils';
import {
  WEBSHARE_PROXY_MSG_ALL_LEASED,
  WEBSHARE_PROXY_MSG_EMPTY_POOL,
  WEBSHARE_PROXY_MSG_MISCONFIGURED,
} from './constants';
import type {
  PortalProxyLease,
  UsableWebshareProxy,
  WebshareProxyRuntimeConfig,
} from './types';
import { buildPatchrightProxyConfig } from './utils/build-patchright-proxy-config.util';
import { createAsyncMutex } from './utils/create-async-mutex.util';
import { createWebshareProxyError } from './utils/create-webshare-proxy-error.util';
import { maskProxyAddress } from './utils/mask-proxy-address.util';
import { WebshareProxyListService } from './webshare-proxy-list.service';

/**
 * In-process mutexed proxy leases (DEC-003 / CON-004).
 * One lease per autofill browser session; fail closed when none free (REQ-011).
 */
@Injectable()
export class PortalProxyLeaseService {
  private readonly logger = new Logger(PortalProxyLeaseService.name);
  private readonly leasedIds = new Set<string>();
  private readonly withMutex = createAsyncMutex();

  constructor(private readonly listService: WebshareProxyListService) {}

  async acquire(config: WebshareProxyRuntimeConfig): Promise<PortalProxyLease> {
    return this.withMutex(async () => {
      if (config.webshareProxyMisconfigured || !config.webshareApiKey) {
        throw createWebshareProxyError(
          'misconfigured',
          WEBSHARE_PROXY_MSG_MISCONFIGURED,
        );
      }

      const mode = config.webshareProxyMode;
      let cache = await this.listService.getUsableProxies(config, false);
      let free = this.pickFree(cache);

      if (!free) {
        cache = await this.listService.getUsableProxies(config, true);
        free = this.pickFree(cache);
      }

      if (!free) {
        if (cache.size === 0) {
          throw createWebshareProxyError(
            'empty_pool',
            WEBSHARE_PROXY_MSG_EMPTY_POOL,
          );
        }
        throw createWebshareProxyError(
          'all_leased',
          WEBSHARE_PROXY_MSG_ALL_LEASED,
        );
      }

      this.leasedIds.add(free.id);
      const leaseToken = uid('wsp').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
      const browserProxy = buildPatchrightProxyConfig(free, mode, leaseToken);

      this.logger.log(
        `Webshare proxy leased id=${free.id} address=${maskProxyAddress(free.proxyAddress)} country=${free.countryCode ?? '-'} mode=${mode}`,
      );

      let released = false;
      const release = async (): Promise<void> => {
        if (released) return;
        released = true;
        await this.release(free.id);
      };

      return { proxy: free, browserProxy, release };
    });
  }

  async release(proxyId: string): Promise<void> {
    await this.withMutex(async () => {
      this.leasedIds.delete(proxyId);
      this.logger.log(`Webshare proxy released id=${proxyId}`);
    });
  }

  private pickFree(
    cache: Map<string, UsableWebshareProxy>,
  ): UsableWebshareProxy | undefined {
    for (const [id, proxy] of cache) {
      if (!this.leasedIds.has(id)) return proxy;
    }
    return undefined;
  }
}
