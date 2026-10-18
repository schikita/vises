/**
 * Proxy6 inventory upsert / admin masked list types (DEC-009 / DEC-010).
 */

import type { Proxy6ProxyListItem } from './proxy6-api.types';

export type MapProxy6ListItemToUpsertFieldsInput = {
  item: Proxy6ProxyListItem;
  /** Period days from buy/prolong request or response (REQ-023). */
  periodDays: number;
  /** Fallback country when item omits it (buy response). */
  countryFallback?: string;
  versionFallback?: number;
  typeFallback?: string;
};

export type Proxy6ListItemUpsertFields = {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  proxyType: string;
  country: string | null;
  version: number;
  periodDays: number;
  date: Date | null;
  dateEnd: Date;
  active: boolean;
  descr: string;
};

export type Proxy6ProxyMaskedOut = {
  id: string;
  maskedHost: string;
  port: number;
  country: string | null;
  version: number;
  proxyType: string;
  periodDays: number;
  dateEnd: string;
  active: boolean;
  inUse: boolean;
  leaseCount: number;
  lastLeasedAt: string | null;
  descr: string;
};

export type Proxy6ProxiesOut = {
  count: number;
  proxies: Proxy6ProxyMaskedOut[];
};

export type Proxy6ProxyStatsItemOut = {
  id: string;
  maskedHost: string;
  inUse: boolean;
  leaseCount: number;
  lastLeasedAt: string | null;
  active: boolean;
  dateEnd: string;
};

export type Proxy6StatsOut = {
  total: number;
  active: number;
  usable: number;
  inUse: number;
  proxies: Proxy6ProxyStatsItemOut[];
};

export type Proxy6BalanceOut = {
  balance: string | number | null;
  currency: string | null;
};

export type Proxy6ReplaceResultOut = {
  boughtIds: string[];
  deletedIds: string[];
  partialFailure: boolean;
  detail?: string;
};
