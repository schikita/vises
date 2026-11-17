import { useTranslation } from 'react-i18next'
import { Btn, Card, Field } from '@/shared/ui'
import { PROXY6_PERIOD_PRESETS_DAYS } from '../../constants'
import type { Proxy6ProxiesPanelRenderProps } from '../../types'
import {
  formatProxy6Balance,
  formatProxy6CountryLabel,
  formatProxy6DateEnd,
  sortProxy6CountryCodes,
} from '../../utils'

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
}: Proxy6ProxiesPanelRenderProps): React.ReactElement => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'en'
  const proxies = inventory?.proxies ?? []
  const count = inventory?.count ?? proxies.length
  const countriesEmpty = !countriesLoading && countries.length === 0
  const sortedCountries = sortProxy6CountryCodes(countries, locale)
  const selectedCountryLabel = country
    ? formatProxy6CountryLabel(country, locale)
    : '—'
  const previewAmount =
    pricePreview?.price !== undefined && pricePreview?.price !== null
      ? String(pricePreview.price)
      : ''
  const hasPreviewPrice = Boolean(previewAmount)

  return (
    <div className="space-y-5">
      <Card className="space-y-4 rounded-panel border border-border bg-surface px-5 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-semibold text-text-primary">
            {t('proxy6.buyTitle')}
          </p>
          <p className="text-sm text-text-secondary">
            {t('proxy6.balanceLabel')}:{' '}
            {balanceLoading
              ? t('proxy6.balanceLoading')
              : formatProxy6Balance(
                  balance?.balance,
                  balance?.currency,
                  t('proxy6.balanceUnavailable'),
                )}
          </p>
        </div>

        {confirming ? (
          <div className="space-y-3 rounded-panel border border-border bg-accent-subtle/40 p-3">
            <p className="font-semibold text-text-primary">
              {t('proxy6.confirmTitle')}
            </p>
            <ul className="space-y-1 text-sm text-text-secondary">
              <li>
                {t('proxy6.confirmCountry')}: {selectedCountryLabel}
              </li>
              <li>
                {t('proxy6.confirmCount')}: {countInput}
              </li>
              <li>
                {t('proxy6.confirmPeriod')}: {periodInput}{' '}
                {t('proxy6.periodDaysSuffix')}
              </li>
              <li>
                {t('proxy6.confirmPrice')}:{' '}
                {hasPreviewPrice ? previewAmount : '—'}
              </li>
            </ul>
            {buyError ? (
              <p className="text-sm font-medium text-danger">{buyError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Btn disabled={buying} onClick={onConfirmBuy}>
                {buying ? t('proxy6.buying') : t('proxy6.confirm')}
              </Btn>
              <Btn
                type="button"
                variant="soft"
                disabled={buying}
                onClick={onCancelConfirm}
              >
                {t('proxy6.cancel')}
              </Btn>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Field label={t('proxy6.countryLabel')} required>
              <select
                className="field"
                value={country}
                disabled={countriesLoading || countriesEmpty || buying}
                onChange={(e): void => {
                  onCountryChange(e.target.value)
                }}
              >
                <option value="">
                  {countriesLoading
                    ? t('proxy6.countriesLoading')
                    : t('proxy6.countryPlaceholder')}
                </option>
                {sortedCountries.map(
                  (code): React.ReactElement => (
                    <option key={code} value={code}>
                      {formatProxy6CountryLabel(code, locale)}
                    </option>
                  ),
                )}
              </select>
            </Field>

            {countriesEmpty ? (
              <p className="text-sm font-medium text-danger">
                {t('proxy6.countriesEmpty')}
              </p>
            ) : null}

            {country ? (
              <p className="text-sm text-text-secondary">
                {t('proxy6.stockHintLabel')}:{' '}
                {stockHintLoading
                  ? t('proxy6.stockHintLoading')
                  : stockHintError
                    ? stockHintError
                    : stockHint === null
                      ? '—'
                      : t('proxy6.stockHintValue', { count: stockHint })}
              </p>
            ) : null}

            <Field label={t('proxy6.countLabel')} required>
              <input
                className="field"
                type="number"
                min={1}
                step={1}
                value={countInput}
                disabled={buying}
                onChange={(e): void => {
                  onCountChange(e.target.value)
                }}
              />
            </Field>

            <Field label={t('proxy6.periodLabel')} required>
              <input
                className="field"
                type="number"
                min={1}
                step={1}
                value={periodInput}
                disabled={buying}
                onChange={(e): void => {
                  onPeriodChange(e.target.value)
                }}
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              {PROXY6_PERIOD_PRESETS_DAYS.map(
                (days): React.ReactElement => (
                  <Btn
                    key={days}
                    type="button"
                    variant="soft"
                    className="px-3 py-1.5 text-xs"
                    disabled={buying}
                    onClick={(): void => {
                      onPeriodPreset(days)
                    }}
                  >
                    {days} {t('proxy6.periodDaysSuffix')}
                  </Btn>
                ),
              )}
            </div>

            <div className="text-sm">
              <p className="font-semibold text-text-primary">
                {t('proxy6.pricePreviewLabel')}
              </p>
              {pricePreviewLoading ? (
                <p className="mt-1 text-text-secondary">
                  {t('proxy6.pricePreviewLoading')}
                </p>
              ) : pricePreviewError ? (
                <p className="mt-1 font-medium text-danger">
                  {pricePreviewError}
                </p>
              ) : hasPreviewPrice ? (
                <p className="mt-1 text-text-primary">{previewAmount}</p>
              ) : (
                <p className="mt-1 text-text-secondary">
                  {t('proxy6.pricePreviewEmpty')}
                </p>
              )}
            </div>

            {buyError ? (
              <p className="text-sm font-medium text-danger">{buyError}</p>
            ) : null}

            <Btn
              type="button"
              disabled={!formValid || buying}
              onClick={onEnterConfirm}
            >
              {t('proxy6.buy')}
            </Btn>
          </div>
        )}

        <p className="text-xs text-text-secondary">{t('proxy6.opsHelp')}</p>
      </Card>

      <Card className="space-y-3 rounded-panel border border-border bg-surface px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-text-primary">
              {t('proxy6.inventoryTitle')}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {listLoading
                ? '…'
                : count > 0
                  ? t('proxy6.inventoryCount', { count })
                  : null}
            </p>
          </div>
          <Btn
            type="button"
            variant="soft"
            disabled={refreshing || listLoading}
            onClick={onRefresh}
          >
            {refreshing ? t('proxy6.refreshing') : t('proxy6.refresh')}
          </Btn>
        </div>

        {error ? (
          <p className="text-sm font-medium text-danger">{error}</p>
        ) : null}

        {listLoading ? (
          <p className="text-sm text-text-secondary">{t('proxy6.listLoading')}</p>
        ) : proxies.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('proxy6.listEmpty')}</p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
            {proxies.map((proxy): React.ReactElement => {
              const statusParts = [
                proxy.active
                  ? t('proxy6.statusActive')
                  : t('proxy6.statusInactive'),
                proxy.inUse ? t('proxy6.statusInUse') : null,
              ].filter(Boolean)

              return (
                <li
                  key={proxy.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 py-1.5 last:border-0"
                >
                  <span className="font-mono text-[13px] text-text-primary">
                    {proxy.maskedHost}:{proxy.port}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {[
                      proxy.country
                        ? formatProxy6CountryLabel(proxy.country, locale)
                        : null,
                      `${t('proxy6.expiryLabel')} ${formatProxy6DateEnd(proxy.dateEnd, t('proxy6.expiryUnknown'))}`,
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
    </div>
  )
}
