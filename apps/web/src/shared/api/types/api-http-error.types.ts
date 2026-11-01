/** HTTP failure thrown by `apiRequest` — carries status for AC-19c 404 handling. */
export type ApiHttpError = Error & {
  readonly name: 'ApiHttpError'
  readonly status: number
  readonly body: unknown
}
