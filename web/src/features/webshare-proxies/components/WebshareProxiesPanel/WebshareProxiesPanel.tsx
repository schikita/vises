import { useEffect, useState } from 'react'
import { apiRequest } from '@/shared/api'
import type { WebshareProxiesOut, WebshareProxiesPanelProps } from '../../types'
import { WebshareProxiesPanelRender } from './WebshareProxiesPanelRender'

export const WebshareProxiesPanel = ({ onError }: WebshareProxiesPanelProps) => {
  const [data, setData] = useState<WebshareProxiesOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const next = await apiRequest<WebshareProxiesOut>('/settings/webshare-proxies')
        if (cancelled) return
        setData(next)
        setError('')
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Не удалось загрузить список прокси'
        setError(message)
        onError?.(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [onError])

  const onRefresh = async () => {
    setRefreshing(true)
    setError('')
    try {
      const next = await apiRequest<WebshareProxiesOut>(
        '/settings/webshare-proxies/refresh',
        { method: 'POST' },
      )
      setData(next)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось обновить список прокси'
      setError(message)
      onError?.(message)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <WebshareProxiesPanelRender
      data={data}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={() => void onRefresh()}
    />
  )
}
