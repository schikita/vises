/** Normalized payments list query (pagination only for v1, REQ-009). */
export type PaymentsListQuery = {
  page: number;
  pageSize: number;
};
