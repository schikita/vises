import { Btn } from '@/shared/ui'
import {
  WEBSHARE_PROXIES_EMPTY_MESSAGE,
  WEBSHARE_PROXIES_REFRESH_LABEL,
  WEBSHARE_PROXIES_REFRESHING_LABEL,
} from '../../constants'
import type { WebshareProxiesOut } from '../../types'
import { formatWebshareRefreshedAt } from '../../utils'

type WebshareProxiesPanelRenderProps = {
  data: WebshareProxiesOut | null
  loading: boolean
  refreshing: boolean
  error: string
  onRefresh: () => void
}

export const WebshareProxiesPanelRender = ({
  data,
  loading,
  refreshing,
  error,
  onRefresh,
}: WebshareProxiesPanelRenderProps) => {
  const proxies = data?.proxies ?? []
  const count = data?.count ?? 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">Прокси Webshare</p>
          <p className="mt-1 text-sm text-muted">
            Последнее обновление:{' '}
            {loading ? '…' : formatWebshareRefreshedAt(data?.refreshedAt ?? null)}
            {!loading && count > 0 ? ` · ${count} шт.` : null}
          </p>
        </div>
        <Btn
          variant="soft"
          disabled={refreshing || loading}
          onClick={onRefresh}
        >
          {refreshing ? WEBSHARE_PROXIES_REFRESHING_LABEL : WEBSHARE_PROXIES_REFRESH_LABEL}
        </Btn>
      </div>

      {error && (
        <p className="text-sm font-semibold text-clay">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Загрузка списка…</p>
      ) : proxies.length === 0 ? (
        <p className="text-sm text-muted">{WEBSHARE_PROXIES_EMPTY_MESSAGE}</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
          {proxies.map((proxy) => (
            <li
              key={proxy.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/60 py-1.5 last:border-0"
            >
              <span className="font-mono text-[13px]">
                {proxy.maskedAddress}:{proxy.port}
              </span>
              {proxy.countryCode ? (
                <span className="text-xs text-muted">{proxy.countryCode}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
