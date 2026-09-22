/** SPA mirrors of Nest `/api/proxy6` outs (DEC-003). No credentials. */

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

/** Proxy6 getprice pass-through fields used by the SPA. */
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

/** POST /proxy6/buy body — version/type omitted (DEC-005). */
export type Proxy6BuyBody = {
  count: number
  period: number
  country: string
}

export type Proxy6ProxiesPanelRenderProps = {
  balance: Proxy6BalanceOut | null
  balanceLoading: boolean
  inventory: Proxy6ProxiesOut | null
  listLoading: boolean
  refreshing: boolean
  error: string
  onRefresh: () => void
  countries: string[]
  countriesLoading: boolean
  country: string
  onCountryChange: (value: string) => void
  countInput: string
  onCountChange: (value: string) => void
  periodInput: string
  onPeriodChange: (value: string) => void
  onPeriodPreset: (days: number) => void
  stockHint: number | null
  stockHintLoading: boolean
  stockHintError: string
  pricePreview: Proxy6PriceOut | null
  pricePreviewLoading: boolean
  pricePreviewError: string
  formValid: boolean
  confirming: boolean
  buying: boolean
  buyError: string
  onEnterConfirm: () => void
  onCancelConfirm: () => void
  onConfirmBuy: () => void
}
