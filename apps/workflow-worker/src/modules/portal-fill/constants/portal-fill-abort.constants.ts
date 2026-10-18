/**
 * Secret-safe abort marker returned by fill façades when AbortSignal fires
 * (bls-workflow-immediate-stop). Mirrors workflow abort vocabulary without
 * importing bls-workflow (dependency direction).
 */
export const PORTAL_FILL_ABORTED_ERROR =
  'Выполнение остановлено (пауза или отмена)';
