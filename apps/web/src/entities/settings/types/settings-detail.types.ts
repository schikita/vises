/**
 * Full GET/PATCH `/settings` payload as returned by the shared API (`SettingsOut`).
 * Wider than contracts `SettingsDto` (`price_per_client` only) — no backend change.
 */
export type SettingsDetailDto = {
  company: string
  price_per_client: string
  cities: string[]
  destinations: string[]
  emailOtpEnabled: boolean
  demoControlsEnabled: boolean
}
