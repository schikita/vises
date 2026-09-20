export type { WebshareProxyOut, WebshareProxiesOut } from './webshare-proxies.types'

export type WebshareProxiesPanelProps = {
  /** Called when parent wants to surface a shared page error (optional). */
  onError?: (message: string) => void
}
