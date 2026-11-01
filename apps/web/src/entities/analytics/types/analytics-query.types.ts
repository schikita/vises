/**
 * Optional `from`/`to` for `GET /stats/roles-applications`.
 * Both omitted → current totals; when set, backend filters by `receivedAt`.
 */
export type AnalyticsQueryParams = {
  from?: string
  to?: string
}
