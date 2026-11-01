/**
 * PATCH /settings body for FE7 — only `price_per_client` (SettingsDto field).
 * Decimal string; do not convert through float.
 */
export type PatchSettingsInput = {
  price_per_client: string
}
