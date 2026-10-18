/** Parity with Python `iso(dt)` for API serializers (`user_out` / `app_out`). */
export const formatIso = (dt: Date | null | undefined): string =>
  dt ? dt.toISOString() : '';
