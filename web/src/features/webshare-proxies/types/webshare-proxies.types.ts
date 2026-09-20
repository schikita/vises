export type WebshareProxyOut = {
  id: string
  maskedAddress: string
  port: number
  countryCode?: string
}

export type WebshareProxiesOut = {
  refreshedAt: string | null
  count: number
  proxies: WebshareProxyOut[]
}
