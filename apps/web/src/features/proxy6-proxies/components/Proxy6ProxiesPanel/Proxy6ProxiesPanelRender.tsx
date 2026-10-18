import { Btn, Card, Field } from '@/shared/ui'
import {
  PROXY6_BALANCE_LABEL,
  PROXY6_BALANCE_LOADING,
  PROXY6_BUY_CARD_TITLE,
  PROXY6_BUY_LABEL,
  PROXY6_BUYING_LABEL,
  PROXY6_CANCEL_LABEL,
  PROXY6_CONFIRM_COUNT,
  PROXY6_CONFIRM_COUNTRY,
  PROXY6_CONFIRM_LABEL,
  PROXY6_CONFIRM_PERIOD,
  PROXY6_CONFIRM_PRICE,
  PROXY6_CONFIRM_SUMMARY_TITLE,
  PROXY6_COUNT_LABEL,
  PROXY6_COUNTRIES_EMPTY,
  PROXY6_COUNTRIES_LOADING,
  PROXY6_COUNTRY_LABEL,
  PROXY6_COUNTRY_PLACEHOLDER,
  PROXY6_EXPIRY_LABEL,
  PROXY6_INVENTORY_CARD_TITLE,
  PROXY6_LIST_EMPTY,
  PROXY6_LIST_LOADING,
  PROXY6_OPS_HELP,
  PROXY6_PERIOD_DAYS_SUFFIX,
  PROXY6_PERIOD_LABEL,
  PROXY6_PERIOD_PRESETS_DAYS,
  PROXY6_PRICE_PREVIEW_EMPTY,
  PROXY6_PRICE_PREVIEW_LABEL,
  PROXY6_PRICE_PREVIEW_LOADING,
  PROXY6_REFRESH_LABEL,
  PROXY6_REFRESHING_LABEL,
  PROXY6_STATUS_ACTIVE,
  PROXY6_STATUS_INACTIVE,
  PROXY6_STATUS_IN_USE,
  PROXY6_STOCK_HINT_LABEL,
  PROXY6_STOCK_HINT_LOADING,
} from '../../constants'
import type { Proxy6ProxiesPanelRenderProps } from '../../types'
import { formatProxy6Balance, formatProxy6DateEnd } from '../../utils'

export const Proxy6ProxiesPanelRender = ({
  balance,
  balanceLoading,
  inventory,
  listLoading,
  refreshing,
  error,
  onRefresh,
  countries,
  countriesLoading,
  country,
  onCountryChange,
  countInput,
  onCountChange,
  periodInput,
  onPeriodChange,
  onPeriodPreset,
  stockHint,
  stockHintLoading,
  stockHintError,
  pricePreview,
  pricePreviewLoading,
  pricePreviewError,
  formValid,
  confirming,
  buying,
  buyError,
  onEnterConfirm,
  onCancelConfirm,
  onConfirmBuy,
}: Proxy6ProxiesPanelRenderProps) => {
  const proxies = inventory?.proxies ?? []
  const count = inventory?.count ?? 0
  const countriesEmpty = !countriesLoading && countries.length === 0
  const previewAmount = formatProxy6Balance(
    pricePreview?.price,
    pricePreview?.currency ?? null,
  )
  const hasPreviewPrice =
    pricePreview?.price !== undefined &&
    pricePreview?.price !== null &&
    String(pricePreview.price).trim() !== ''

  return (
    <>
      <Card className="mt-5 space-y-3">
        <div>
          <p className="font-bold">{PROXY6_BUY_CARD_TITLE}</p>
          <p className="mt-1 text-sm text-muted">
            {PROXY6_BALANCE_LABEL}:{' '}
            {balanceLoading
              ? PROXY6_BALANCE_LOADING
              : formatProxy6Balance(balance?.balance, balance?.currency)}
          </p>
        </div>

        {confirming ? (
          <div className="space-y-3 rounded-xl border border-line bg-sand/40 p-3">
            <p className="text-sm font-bold">{PROXY6_CONFIRM_SUMMARY_TITLE}</p>
            <ul className="space-y-1 text-sm">
              <li>
                {PROXY6_CONFIRM_COUNTRY}: <span className="font-semibold">{country}</span>
              </li>
              <li>
                {PROXY6_CONFIRM_COUNT}:{' '}
                <span className="font-semibold">{countInput}</span>
              </li>
              <li>
                {PROXY6_CONFIRM_PERIOD}:{' '}
                <span className="font-semibold">
                  {periodInput} {PROXY6_PERIOD_DAYS_SUFFIX}
                </span>
              </li>
              <li>
                {PROXY6_CONFIRM_PRICE}:{' '}
                <span className="font-semibold">
                  {hasPreviewPrice ? previewAmount : '—'}
                </span>
              </li>
            </ul>
            {buyError ? (
              <p className="text-sm font-semibold text-clay">{buyError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Btn disabled={buying} onClick={onConfirmBuy}>
                {buying ? PROXY6_BUYING_LABEL : PROXY6_CONFIRM_LABEL}
              </Btn>
              <Btn variant="ghost" disabled={buying} onClick={onCancelConfirm}>
                {PROXY6_CANCEL_LABEL}
              </Btn>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Field label={PROXY6_COUNTRY_LABEL} required>
              <select
                className="field"
                value={country}
                disabled={countriesLoading || countriesEmpty || buying}
                onChange={(e) => onCountryChange(e.target.value)}
              >
                <option value="">
                  {countriesLoading
                    ? PROXY6_COUNTRIES_LOADING
                    : PROXY6_COUNTRY_PLACEHOLDER}
                </option>
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </Field>

            {countriesEmpty ? (
              <p className="text-sm font-semibold text-clay">
                {PROXY6_COUNTRIES_EMPTY}
              </p>
            ) : null}

            {country ? (
              <p className="text-sm text-muted">
                {PROXY6_STOCK_HINT_LABEL}:{' '}
                {stockHintLoading
                  ? PROXY6_STOCK_HINT_LOADING
                  : stockHintError
                    ? stockHintError
                    : stockHint === null
                      ? '—'
                      : `${stockHint} шт.`}
              </p>
            ) : null}

            <Field label={PROXY6_COUNT_LABEL} required>
              <input
                className="field"
                type="number"
                min={1}
                step={1}
                value={countInput}
                disabled={buying}
                onChange={(e) => onCountChange(e.target.value)}
              />
            </Field>

            <Field label={PROXY6_PERIOD_LABEL} required>
              <input
                className="field"
                type="number"
                min={1}
                step={1}
                value={periodInput}
                disabled={buying}
                onChange={(e) => onPeriodChange(e.target.value)}
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              {PROXY6_PERIOD_PRESETS_DAYS.map((days) => (
                <Btn
                  key={days}
                  variant="soft"
                  className="px-3 py-1.5 text-xs"
                  disabled={buying}
                  onClick={() => onPeriodPreset(days)}
                >
                  {days} {PROXY6_PERIOD_DAYS_SUFFIX}
                </Btn>
              ))}
            </div>

            <div className="text-sm">
              <p className="font-semibold">{PROXY6_PRICE_PREVIEW_LABEL}</p>
              {pricePreviewLoading ? (
                <p className="mt-1 text-muted">{PROXY6_PRICE_PREVIEW_LOADING}</p>
              ) : pricePreviewError ? (
                <p className="mt-1 font-semibold text-clay">{pricePreviewError}</p>
              ) : hasPreviewPrice ? (
                <p className="mt-1">{previewAmount}</p>
              ) : (
                <p className="mt-1 text-muted">{PROXY6_PRICE_PREVIEW_EMPTY}</p>
              )}
            </div>

            {buyError ? (
              <p className="text-sm font-semibold text-clay">{buyError}</p>
            ) : null}

            <Btn disabled={!formValid || buying} onClick={onEnterConfirm}>
              {PROXY6_BUY_LABEL}
            </Btn>
          </div>
        )}

        <p className="text-xs text-muted">{PROXY6_OPS_HELP}</p>
      </Card>

      <Card className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">{PROXY6_INVENTORY_CARD_TITLE}</p>
            <p className="mt-1 text-sm text-muted">
              {listLoading ? '…' : count > 0 ? `${count} шт.` : null}
            </p>
          </div>
          <Btn variant="soft" disabled={refreshing || listLoading} onClick={onRefresh}>
            {refreshing ? PROXY6_REFRESHING_LABEL : PROXY6_REFRESH_LABEL}
          </Btn>
        </div>

        {error ? <p className="text-sm font-semibold text-clay">{error}</p> : null}

        {listLoading ? (
          <p className="text-sm text-muted">{PROXY6_LIST_LOADING}</p>
        ) : proxies.length === 0 ? (
          <p className="text-sm text-muted">{PROXY6_LIST_EMPTY}</p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
            {proxies.map((proxy) => {
              const statusParts = [
                proxy.active ? PROXY6_STATUS_ACTIVE : PROXY6_STATUS_INACTIVE,
                proxy.inUse ? PROXY6_STATUS_IN_USE : null,
              ].filter(Boolean)

              return (
                <li
                  key={proxy.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/60 py-1.5 last:border-0"
                >
                  <span className="font-mono text-[13px]">
                    {proxy.maskedHost}:{proxy.port}
                  </span>
                  <span className="text-xs text-muted">
                    {[
                      proxy.country,
                      `${PROXY6_EXPIRY_LABEL} ${formatProxy6DateEnd(proxy.dateEnd)}`,
                      statusParts.join(' · '),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
