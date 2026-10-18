/**
 * Proxy6 API client domain types (proxy6-migration DEC-008).
 * Credentials / API key must never appear in operator-facing messages.
 */

export type Proxy6ApiMethod =
  | 'getproxy'
  | 'getprice'
  | 'getcount'
  | 'getcountry'
  | 'buy'
  | 'prolong'
  | 'delete'
  | 'deleted'
  | 'check'
  | 'setdescr';

/** Success / failure envelope shared by all Proxy6 methods. */
export type Proxy6ApiStatus = 'yes' | 'no';

export type Proxy6ApiErrorBody = {
  status: 'no';
  error_id?: number | string;
  error?: string;
};

export type Proxy6ApiSuccessBase = {
  status: 'yes';
  user_id?: string | number;
  balance?: string | number;
  currency?: string;
};

export type Proxy6ProxyListItem = {
  id?: string | number;
  ip?: string;
  host?: string;
  port?: string | number;
  user?: string;
  pass?: string;
  type?: string;
  country?: string;
  date?: string;
  date_end?: string;
  unixtime?: number | string;
  unixtime_end?: number | string;
  descr?: string;
  active?: string | number | boolean;
  version?: number | string;
};

export type Proxy6GetProxyResponse = Proxy6ApiSuccessBase & {
  list_count?: number;
  list?: Record<string, Proxy6ProxyListItem> | Proxy6ProxyListItem[];
};

export type Proxy6GetPriceResponse = Proxy6ApiSuccessBase & {
  price?: number;
  price_single?: number;
  period?: number;
  count?: number;
  data?: Record<string, Record<string, number>>;
};

export type Proxy6GetCountResponse = Proxy6ApiSuccessBase & {
  count?: number;
};

export type Proxy6GetCountryResponse = Proxy6ApiSuccessBase & {
  list?: string[];
};

export type Proxy6BuyResponse = Proxy6ApiSuccessBase & {
  order_id?: number | string;
  count?: number;
  price?: number;
  price_single?: number;
  period?: number;
  country?: string;
  list?: Record<string, Proxy6ProxyListItem> | Proxy6ProxyListItem[];
};

export type Proxy6ProlongListItem = {
  id?: string | number;
  date_end?: string;
  unixtime_end?: number | string;
};

export type Proxy6ProlongResponse = Proxy6ApiSuccessBase & {
  order_id?: number | string;
  price?: number;
  price_single?: number;
  period?: number;
  count?: number;
  list?: Record<string, Proxy6ProlongListItem> | Proxy6ProlongListItem[];
};

export type Proxy6DeleteResponse = Proxy6ApiSuccessBase & {
  count?: number;
};

export type Proxy6CheckResponse = Proxy6ApiSuccessBase & {
  proxy_id?: number | string;
  proxy_status?: boolean;
};

export type Proxy6SetDescrResponse = Proxy6ApiSuccessBase & {
  count?: number;
};

export type Proxy6BalanceResponse = Proxy6ApiSuccessBase;

export type Proxy6QueryValue = string | number | boolean | undefined;

export type Proxy6QueryParams = Record<string, Proxy6QueryValue>;

export type BuildProxy6ApiUrlInput = {
  apiKey: string;
  method?: Proxy6ApiMethod | '';
  params?: Proxy6QueryParams;
};

export type Proxy6GetProxyParams = {
  state?: 'active' | 'expired' | 'expiring' | 'all';
  descr?: string;
  nokey?: boolean;
  page?: number;
  limit?: number;
};

export type Proxy6GetPriceParams = {
  count?: number;
  period?: number;
  version?: number;
};

export type Proxy6GetCountParams = {
  country: string;
  version?: number;
};

export type Proxy6GetCountryParams = {
  version?: number;
};

export type Proxy6BuyParams = {
  count: number;
  period: number;
  country: string;
  version?: number;
  type?: string;
  descr?: string;
  autoProlong?: boolean;
  nokey?: boolean;
};

export type Proxy6ProlongParams = {
  period: number;
  ids: string[];
  nokey?: boolean;
};

export type Proxy6DeleteParams = {
  ids?: string[];
  descr?: string;
};

export type Proxy6CheckParams = {
  ids?: string;
  proxy?: string;
};

export type Proxy6SetDescrParams = {
  new: string;
  old?: string;
  ids?: string[];
};
