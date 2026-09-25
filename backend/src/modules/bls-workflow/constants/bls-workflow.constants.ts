/**
 * Durable BLS workflow status / step / attempt / vault literals (REQ-001 / REQ-026).
 * Named constants only — no helper functions (types-constants-utils).
 * Aligns with docs/sdd/01-target-architecture.md state machines.
 */

/** Workflow lifecycle on `bls_workflows.status` (REQ-001). */
export const BLS_WORKFLOW_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  WAITING_RETRY: 'WAITING_RETRY',
  WAITING_STAFF: 'WAITING_STAFF',
  PAUSED: 'PAUSED',
  AWAITING_STAFF_BOOKING: 'AWAITING_STAFF_BOOKING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  ABANDONED: 'ABANDONED',
} as const;

/**
 * Non-terminal statuses — at most one workflow per application (REQ-001 / DEC-013).
 * Used by partial unique index in schema.bootstrap.
 */
export const BLS_WORKFLOW_ACTIVE_STATUSES = [
  BLS_WORKFLOW_STATUS.PENDING,
  BLS_WORKFLOW_STATUS.RUNNING,
  BLS_WORKFLOW_STATUS.WAITING_RETRY,
  BLS_WORKFLOW_STATUS.WAITING_STAFF,
  BLS_WORKFLOW_STATUS.PAUSED,
] as const;

/** Ordered step keys on `bls_workflow_steps.step_key`. */
export const BLS_WORKFLOW_STEP_KEY = {
  REGISTER: 'REGISTER',
  LOGIN: 'LOGIN',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  STATUS_VALIDATE: 'STATUS_VALIDATE',
  BOOK: 'BOOK',
} as const;

/** Step lifecycle on `bls_workflow_steps.status`. */
export const BLS_WORKFLOW_STEP_STATUS = {
  PENDING: 'PENDING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  FAILED: 'FAILED',
  WAITING: 'WAITING',
} as const;

/** Task lifecycle on `bls_workflow_tasks.status`. */
export const BLS_WORKFLOW_TASK_STATUS = {
  PENDING: 'PENDING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  WAITING: 'WAITING',
  SKIPPED: 'SKIPPED',
} as const;

/** Attempt outcome on `bls_workflow_attempts.outcome`. */
export const BLS_WORKFLOW_ATTEMPT_OUTCOME = {
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  ABORTED: 'ABORTED',
} as const;

/** Retry classification on attempts / tasks (DEC-004). */
export const BLS_WORKFLOW_ERROR_CLASS = {
  SAFE_TO_REPEAT: 'SAFE_TO_REPEAT',
  VERIFY_THEN_REPEAT: 'VERIFY_THEN_REPEAT',
  NOT_SAFE_TO_REPEAT: 'NOT_SAFE_TO_REPEAT',
} as const;

/** Secret purpose on `bls_secret_vault.purpose` — owned by bls-secrets. */
export {
  BLS_SECRET_PURPOSE,
  BLS_SECRET_PURPOSE_MAILTM_CLEANUP,
} from '../../bls-secrets/constants/bls-secret-purpose.constants';

/**
 * Grace before deferred Mail.tm delete + MAILTM_* purge (REQ-007 / DEC-004).
 * 72 hours from eligible terminal transition.
 */
export const BLS_WORKFLOW_MAILBOX_CLEANUP_GRACE_MS = 72 * 60 * 60 * 1000;

/** Max workflows processed per due-mailbox cleanup tick. */
export const BLS_WORKFLOW_MAILBOX_CLEANUP_PURGE_BATCH = 50;

/** Default `bls_workflows.schema_version`. */
export const BLS_WORKFLOW_SCHEMA_VERSION_DEFAULT = 1;

/** Default max auto attempts per task (DEC-014). */
export const BLS_WORKFLOW_TASK_MAX_ATTEMPTS_DEFAULT = 5;

/**
 * In-process runner poll interval (DEC-002).
 * No Bull/Redis/cron — Nest `setInterval` tick only.
 */
export const BLS_WORKFLOW_RUNNER_TICK_MS = 5_000;

/**
 * Exponential backoff base: `base × 2^(attemptNo-1)` (DEC-014).
 * First auto-retry waits 5s.
 */
export const BLS_WORKFLOW_RETRY_BACKOFF_BASE_MS = 5_000;

/** Exponential backoff cap (DEC-014) — 5 minutes. */
export const BLS_WORKFLOW_RETRY_BACKOFF_CAP_MS = 300_000;

/** Stub executor safe error code (until TASK-007+ domain clients). */
export const BLS_WORKFLOW_EXECUTOR_STUB_ERROR_CODE = 'executor_stub';

/** Stub executor safe operator-facing detail (no secrets). */
export const BLS_WORKFLOW_EXECUTOR_STUB_ERROR_MESSAGE =
  'Исполнитель задачи workflow ещё не подключён';

/**
 * Terminal statuses that schedule deferred Mail.tm / MAILTM_* cleanup
 * and gate portal-credentials reveal (REQ-016 amends / DEC-002 / DEC-004 / DEC-007).
 * Does not include COMPLETED (verify path).
 */
export const BLS_WORKFLOW_MAILBOX_CLEANUP_STATUSES = [
  BLS_WORKFLOW_STATUS.AWAITING_STAFF_BOOKING,
  BLS_WORKFLOW_STATUS.FAILED,
  BLS_WORKFLOW_STATUS.CANCELLED,
  BLS_WORKFLOW_STATUS.ABANDONED,
] as const;

/** Event retention days after terminal (DEC-020). */
export const BLS_WORKFLOW_EVENT_RETENTION_DAYS = 30;

/** Max event rows deleted per best-effort TTL tick (DEC-020). */
export const BLS_WORKFLOW_EVENT_RETENTION_PURGE_BATCH = 500;

/**
 * Append-only event types for poll UI / audit (REQ-029 / DEC-020).
 * payload_safe only — never secrets.
 */
export const BLS_WORKFLOW_EVENT_TYPE = {
  WORKFLOW_CREATED: 'WORKFLOW_CREATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  STEP_COMPLETED: 'STEP_COMPLETED',
  STEP_SKIPPED: 'STEP_SKIPPED',
  TASK_FAILED: 'TASK_FAILED',
  WORKFLOW_STATUS_CHANGED: 'WORKFLOW_STATUS_CHANGED',
  WORKFLOW_ABANDONED: 'WORKFLOW_ABANDONED',
  AWAITING_STAFF_BOOKING: 'AWAITING_STAFF_BOOKING',
  /** Soft link REGISTER step → portal_autofill_runs (DEC-012); payloadSafe.runId only. */
  AUTOFILL_RUN_LINKED: 'AUTOFILL_RUN_LINKED',
  /**
   * Staff revealed portal credentials (portal-credential-reveal DEC-006).
   * payloadSafe: { actorUserId } only — never password/email.
   */
  PORTAL_CREDENTIALS_REVEALED: 'PORTAL_CREDENTIALS_REVEALED',
} as const;

/** Default page size for GET …/events (DEC-006 poll). */
export const BLS_WORKFLOW_EVENTS_DEFAULT_LIMIT = 100;

/** Max page size for GET …/events. */
export const BLS_WORKFLOW_EVENTS_MAX_LIMIT = 200;

/**
 * Workflow lock heartbeat interval (DEC-003 / autofill parity).
 * Runner / executor should renew `lock_heartbeat_at` at least this often.
 */
export const BLS_WORKFLOW_LOCK_HEARTBEAT_MS = 30_000;

/**
 * Lock is stale when `lock_heartbeat_at` is older than this TTL (DEC-003).
 * Stale locks are reclaimable by acquire / claimDueWorkflow.
 */
export const BLS_WORKFLOW_LOCK_STALE_MS = 120_000;

/** Typed error name for live-lock / concurrent claim conflicts (REQ-005). */
export const BLS_WORKFLOW_LOCK_ERROR_NAME = 'BlsWorkflowLockError';

/**
 * Statuses the DB runner may claim when `next_run_at` is due (DEC-002).
 * Excludes PAUSED / WAITING_STAFF (human gate) and terminals.
 */
export const BLS_WORKFLOW_CLAIMABLE_STATUSES = [
  BLS_WORKFLOW_STATUS.PENDING,
  BLS_WORKFLOW_STATUS.RUNNING,
  BLS_WORKFLOW_STATUS.WAITING_RETRY,
] as const;

/**
 * Terminal workflow statuses (non-active).
 * BOOK Must success uses `AWAITING_STAFF_BOOKING` — not `COMPLETED` (DEC-010).
 */
export const BLS_WORKFLOW_TERMINAL_STATUSES = [
  BLS_WORKFLOW_STATUS.AWAITING_STAFF_BOOKING,
  BLS_WORKFLOW_STATUS.COMPLETED,
  BLS_WORKFLOW_STATUS.FAILED,
  BLS_WORKFLOW_STATUS.CANCELLED,
  BLS_WORKFLOW_STATUS.ABANDONED,
] as const;

/** Ordered step keys REGISTER → BOOK (REQ-002). */
export const BLS_WORKFLOW_STEP_ORDER = [
  BLS_WORKFLOW_STEP_KEY.REGISTER,
  BLS_WORKFLOW_STEP_KEY.LOGIN,
  BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE,
  BLS_WORKFLOW_STEP_KEY.STATUS_VALIDATE,
  BLS_WORKFLOW_STEP_KEY.BOOK,
] as const;

/** Task keys within steps (placeholders; domain clients fill behavior later). */
export const BLS_WORKFLOW_TASK_KEY = {
  REGISTER_SUBMIT: 'REGISTER_SUBMIT',
  LOGIN_AUTH: 'LOGIN_AUTH',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  STATUS_APPLICANT: 'STATUS_APPLICANT',
  BOOK_OPEN: 'BOOK_OPEN',
} as const;

/** Step statuses that are finished (no further work in step). */
export const BLS_WORKFLOW_STEP_DONE_STATUSES = [
  BLS_WORKFLOW_STEP_STATUS.COMPLETED,
  BLS_WORKFLOW_STEP_STATUS.SKIPPED,
  BLS_WORKFLOW_STEP_STATUS.FAILED,
] as const;

/** Task statuses that are finished. */
export const BLS_WORKFLOW_TASK_DONE_STATUSES = [
  BLS_WORKFLOW_TASK_STATUS.COMPLETED,
  BLS_WORKFLOW_TASK_STATUS.SKIPPED,
  BLS_WORKFLOW_TASK_STATUS.FAILED,
] as const;

/** Task statuses still open for runner / advance. */
export const BLS_WORKFLOW_TASK_OPEN_STATUSES = [
  BLS_WORKFLOW_TASK_STATUS.PENDING,
  BLS_WORKFLOW_TASK_STATUS.READY,
  BLS_WORKFLOW_TASK_STATUS.RUNNING,
  BLS_WORKFLOW_TASK_STATUS.WAITING,
] as const;

/** Russian operator-facing details for workflow control (NFR-001 / 03-workflow-api §5). */
export const BLS_WORKFLOW_MSG_ACTIVE_EXISTS =
  'Для этой заявки уже выполняется сценарий BLS';

/** Russian `{ detail }` when workflow missing (03-workflow-api §5). */
export const BLS_WORKFLOW_MSG_NOT_FOUND = 'Сценарий не найден';

export const BLS_WORKFLOW_MSG_APP_NOT_FOUND = 'Заявка не найдена';

export const BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY =
  'Нельзя отметить COMPLETED без проверки внешнего состояния портала';

export const BLS_WORKFLOW_MSG_TASK_NOT_FOUND = 'Задача workflow не найдена';

export const BLS_WORKFLOW_MSG_STEP_NOT_FOUND = 'Шаг workflow не найден';

export const BLS_WORKFLOW_MSG_STEP_NOT_SKIPPABLE =
  'Этот шаг нельзя пропустить';

export const BLS_WORKFLOW_MSG_TERMINAL =
  'Workflow уже завершён и не может быть изменён';

export const BLS_WORKFLOW_MSG_SUPERSEDED = 'superseded_by_staff';

/** Russian `{ detail }` when a live non-stale lock blocks concurrent claim (REQ-005). */
export const BLS_WORKFLOW_MSG_LIVE_LOCK = 'Сценарий уже выполняется';

/** Manual retry not allowed for current workflow/task state (03-workflow-api §5). */
export const BLS_WORKFLOW_MSG_RETRY_NOT_ELIGIBLE =
  'Повтор недоступен для текущего состояния';

/** Resume not allowed for current workflow state. */
export const BLS_WORKFLOW_MSG_RESUME_NOT_ELIGIBLE =
  'Возобновление недоступно для текущего состояния';

/** Pause not allowed for current workflow state. */
export const BLS_WORKFLOW_MSG_PAUSE_NOT_ELIGIBLE =
  'Пауза недоступна для текущего состояния';

/** Cancel not allowed (already terminal other than CANCELLED). */
export const BLS_WORKFLOW_MSG_CANCEL_NOT_ELIGIBLE =
  'Отмена недоступна для текущего состояния';

/** Reveal denied: workflow status not in mailbox-cleanup set (DEC-002). */
export const BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_NOT_ELIGIBLE =
  'Учётные данные портала недоступны для текущего состояния сценария';

/** Reveal fail-closed: blank Application.portalFormEmail (REQ-011 / DEC-008). */
export const BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_EMAIL_MISSING =
  'Email регистрации на портале не задан';

/** Reveal fail-closed: missing vault PORTAL_PASSWORD (REQ-010 / DEC-008). */
export const BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_PASSWORD_MISSING =
  'Пароль портала не найден в хранилище';

/** Reveal fail-closed: missing vault PORTAL_PASSWORD_INITIAL. */
export const BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_INITIAL_PASSWORD_MISSING =
  'Первичный пароль портала (из письма) не найден в хранилище';

/**
 * Abort attempt error code (DEC-008 / REQ-007).
 * Secret-safe — never include passwords, tokens, or proxy creds.
 */
export const BLS_WORKFLOW_ABORT_ERROR_CODE = 'workflow_aborted';

/** Russian operator-facing abort message (DEC-008 / NFR-004). */
export const BLS_WORKFLOW_ABORT_ERROR_MESSAGE =
  'Выполнение остановлено (пауза или отмена)';
