import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiRequest } from '@/shared/api'
import {
  PROXY6_MIN_COUNT,
  PROXY6_MIN_PERIOD_DAYS,
  PROXY6_PRICE_PREVIEW_DEBOUNCE_MS,
} from '../../constants'
import type {
  Proxy6BalanceOut,
  Proxy6BuyBody,
  Proxy6CountOut,
  Proxy6CountriesOut,
  Proxy6PriceOut,
  Proxy6ProxiesOut,
} from '../../types'
import {
  buildProxy6Query,
  isStaleProxy6Preview,
  parseProxy6PositiveInt,
} from '../../utils'
import { Proxy6ProxiesPanelRender } from './Proxy6ProxiesPanelRender'

export const Proxy6ProxiesPanel = (): React.ReactElement => {
  const { t } = useTranslation()
  const [balance, setBalance] = useState<Proxy6BalanceOut | null>(null)
  const [inventory, setInventory] = useState<Proxy6ProxiesOut | null>(null)
  const [countries, setCountries] = useState<string[]>([])
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [country, setCountry] = useState('')
  const [countInput, setCountInput] = useState('1')
  const [periodInput, setPeriodInput] = useState('30')

  const [stockHint, setStockHint] = useState<number | null>(null)
  const [stockHintLoading, setStockHintLoading] = useState(false)
  const [stockHintError, setStockHintError] = useState('')

  const [pricePreview, setPricePreview] = useState<Proxy6PriceOut | null>(null)
  const [pricePreviewLoading, setPricePreviewLoading] = useState(false)
  const [pricePreviewError, setPricePreviewError] = useState('')

  const [confirming, setConfirming] = useState(false)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')

  const priceGenerationRef = useRef(0)
  const stockGenerationRef = useRef(0)

  const countValue = parseProxy6PositiveInt(countInput, PROXY6_MIN_COUNT)
  const periodValue = parseProxy6PositiveInt(
    periodInput,
    PROXY6_MIN_PERIOD_DAYS,
  )
  const formValid =
    Boolean(country) &&
    countries.length > 0 &&
    countValue !== null &&
    periodValue !== null

  useEffect((): (() => void) => {
    let cancelled = false

    void (async (): Promise<void> => {
      setBalanceLoading(true)
      setListLoading(true)
      setCountriesLoading(true)
      setError('')

      const [balanceResult, proxiesResult, countriesResult] =
        await Promise.allSettled([
          apiRequest<Proxy6BalanceOut>('/proxy6/balance'),
          apiRequest<Proxy6ProxiesOut>('/proxy6/proxies'),
          apiRequest<Proxy6CountriesOut>('/proxy6/countries'),
        ])

      if (cancelled) return

      if (balanceResult.status === 'fulfilled') {
        setBalance(balanceResult.value)
      } else {
        setBalance(null)
      }

      if (proxiesResult.status === 'fulfilled') {
        setInventory(proxiesResult.value)
      } else {
        setInventory(null)
      }

      if (countriesResult.status === 'fulfilled') {
        setCountries(countriesResult.value.list ?? [])
      } else {
        setCountries([])
      }

      const messages: string[] = []
      if (balanceResult.status === 'rejected') {
        messages.push(
          balanceResult.reason instanceof Error
            ? balanceResult.reason.message
            : t('proxy6.loadError'),
        )
      }
      if (proxiesResult.status === 'rejected') {
        messages.push(
          proxiesResult.reason instanceof Error
            ? proxiesResult.reason.message
            : t('proxy6.loadError'),
        )
      }
      if (countriesResult.status === 'rejected') {
        messages.push(
          countriesResult.reason instanceof Error
            ? countriesResult.reason.message
            : t('proxy6.loadError'),
        )
      }
      if (messages.length > 0) {
        setError(messages.join(' · '))
      }

      setBalanceLoading(false)
      setListLoading(false)
      setCountriesLoading(false)
    })()

    return (): void => {
      cancelled = true
    }
  }, [t])

  const priceInputsValid = countValue !== null && periodValue !== null

  useEffect((): (() => void) | undefined => {
    if (!priceInputsValid || countValue === null || periodValue === null) {
      priceGenerationRef.current += 1
      return undefined
    }

    const generation = ++priceGenerationRef.current

    const timer = window.setTimeout((): void => {
      void (async (): Promise<void> => {
        if (isStaleProxy6Preview(generation, priceGenerationRef.current)) {
          return
        }
        setPricePreviewLoading(true)
        setPricePreviewError('')
        try {
          const query = buildProxy6Query({
            count: countValue,
            period: periodValue,
          })
          const result = await apiRequest<Proxy6PriceOut>(
            `/proxy6/price${query}`,
          )
          if (isStaleProxy6Preview(generation, priceGenerationRef.current)) {
            return
          }
          setPricePreview(result)
          setPricePreviewError('')
        } catch (err) {
          if (isStaleProxy6Preview(generation, priceGenerationRef.current)) {
            return
          }
          setPricePreview(null)
          setPricePreviewError(
            err instanceof Error ? err.message : t('proxy6.priceError'),
          )
        } finally {
          if (!isStaleProxy6Preview(generation, priceGenerationRef.current)) {
            setPricePreviewLoading(false)
          }
        }
      })()
    }, PROXY6_PRICE_PREVIEW_DEBOUNCE_MS)

    return (): void => {
      window.clearTimeout(timer)
    }
  }, [countValue, periodValue, priceInputsValid, t])

  useEffect((): void => {
    if (!country) {
      stockGenerationRef.current += 1
      return
    }

    const generation = ++stockGenerationRef.current

    void (async (): Promise<void> => {
      if (isStaleProxy6Preview(generation, stockGenerationRef.current)) {
        return
      }
      setStockHintLoading(true)
      setStockHintError('')
      try {
        const query = buildProxy6Query({ country })
        const result = await apiRequest<Proxy6CountOut>(
          `/proxy6/count${query}`,
        )
        if (isStaleProxy6Preview(generation, stockGenerationRef.current)) {
          return
        }
        setStockHint(
          typeof result.count === 'number' && Number.isFinite(result.count)
            ? result.count
            : null,
        )
        setStockHintError('')
      } catch (err) {
        if (isStaleProxy6Preview(generation, stockGenerationRef.current)) {
          return
        }
        setStockHint(null)
        setStockHintError(
          err instanceof Error ? err.message : t('proxy6.loadError'),
        )
      } finally {
        if (!isStaleProxy6Preview(generation, stockGenerationRef.current)) {
          setStockHintLoading(false)
        }
      }
    })()
  }, [country, t])

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true)
    setError('')
    try {
      const next = await apiRequest<Proxy6ProxiesOut>(
        '/proxy6/proxies/refresh',
        { method: 'POST' },
      )
      setInventory(next)

      try {
        const nextBalance =
          await apiRequest<Proxy6BalanceOut>('/proxy6/balance')
        setBalance(nextBalance)
      } catch {
        // Keep prior balance; list refresh already succeeded.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('proxy6.refreshError'))
    } finally {
      setRefreshing(false)
    }
  }

  const onEnterConfirm = (): void => {
    if (!formValid || buying) return
    setBuyError('')
    setConfirming(true)
  }

  const onCancelConfirm = (): void => {
    if (buying) return
    setConfirming(false)
    setBuyError('')
  }

  const onConfirmBuy = async (): Promise<void> => {
    if (!formValid || countValue === null || periodValue === null || buying) {
      return
    }

    setBuying(true)
    setBuyError('')

    const body: Proxy6BuyBody = {
      count: countValue,
      period: periodValue,
      country,
    }

    try {
      const next = await apiRequest<Proxy6ProxiesOut>('/proxy6/buy', {
        method: 'POST',
        data: body,
      })
      setInventory(next)
      setConfirming(false)

      try {
        const nextBalance =
          await apiRequest<Proxy6BalanceOut>('/proxy6/balance')
        setBalance(nextBalance)
      } catch {
        // Inventory already updated from buy response.
      }
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : t('proxy6.buyError'))
    } finally {
      setBuying(false)
    }
  }

  return (
    <Proxy6ProxiesPanelRender
      balance={balance}
      balanceLoading={balanceLoading}
      inventory={inventory}
      listLoading={listLoading}
      refreshing={refreshing}
      error={error}
      onRefresh={(): void => {
        void onRefresh()
      }}
      countries={countries}
      countriesLoading={countriesLoading}
      country={country}
      onCountryChange={(value): void => {
        setCountry(value)
        setConfirming(false)
        setBuyError('')
      }}
      countInput={countInput}
      onCountChange={(value): void => {
        setCountInput(value)
        setConfirming(false)
        setBuyError('')
      }}
      periodInput={periodInput}
      onPeriodChange={(value): void => {
        setPeriodInput(value)
        setConfirming(false)
        setBuyError('')
      }}
      onPeriodPreset={(days): void => {
        setPeriodInput(String(days))
        setConfirming(false)
        setBuyError('')
      }}
      stockHint={country ? stockHint : null}
      stockHintLoading={Boolean(country) && stockHintLoading}
      stockHintError={country ? stockHintError : ''}
      pricePreview={priceInputsValid ? pricePreview : null}
      pricePreviewLoading={priceInputsValid && pricePreviewLoading}
      pricePreviewError={priceInputsValid ? pricePreviewError : ''}
      formValid={formValid}
      confirming={confirming}
      buying={buying}
      buyError={buyError}
      onEnterConfirm={onEnterConfirm}
      onCancelConfirm={onCancelConfirm}
      onConfirmBuy={(): void => {
        void onConfirmBuy()
      }}
    />
  )
}
