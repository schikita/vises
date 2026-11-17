/**
 * PATCH `/settings` body — all fields optional on the API.
 * Price stays a decimal string (NFR-1); lists are trimmed server-side.
 */
export type PatchSettingsInput = {
  company?: string
  price_per_client?: string
  cities?: string[]
  destinations?: string[]
}
