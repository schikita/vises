export type SystemSettings = {
  company: string
  defaultPrice: number
  cities: string[]
  destinations: string[]
  emailOtpEnabled: boolean
  /** From API: show demo reset only when true (DEC-010). */
  demoControlsEnabled: boolean
}
