export type SystemSettings = {
  company: string
  defaultPrice: number
  cities: string[]
  destinations: string[]
  webshareProxyEnabled: boolean
  websharePlanId: string
  emailOtpEnabled: boolean
  /** From API: show demo reset only when true (DEC-010). */
  demoControlsEnabled: boolean
}
