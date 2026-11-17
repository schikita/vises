import type {
  Proxy6BalanceOut,
  Proxy6PriceOut,
  Proxy6ProxiesOut,
} from './proxy6-proxies.types'

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
