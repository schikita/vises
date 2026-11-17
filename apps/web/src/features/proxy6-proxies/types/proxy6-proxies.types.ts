/** SPA mirrors of Nest `/api/proxy6` outs. No credentials. */

export type Proxy6BalanceOut = {
  balance: string | number | null
  currency: string | null
}

export type Proxy6ProxyMaskedOut = {
  id: string
  maskedHost: string
  port: number
  country: string | null
  version: number
  proxyType: string
  periodDays: number
  dateEnd: string
  active: boolean
  inUse: boolean
  leaseCount: number
  lastLeasedAt: string | null
  descr: string
}

export type Proxy6ProxiesOut = {
  count: number
  proxies: Proxy6ProxyMaskedOut[]
}

export type Proxy6PriceOut = {
  price?: string | number
  price_single?: string | number
  period?: string | number
  count?: string | number
  balance?: string | number
  currency?: string
}

export type Proxy6CountriesOut = {
  list?: string[]
}

export type Proxy6CountOut = {
  count?: number
}

export type Proxy6BuyBody = {
  count: number
  period: number
  country: string
}
