import {
  BLS_WORKFLOW_STATUS,
  blsWorkflowStatusLabel,
  blsWorkflowStepKeyLabel,
  blsWorkflowTaskKeyLabel,
} from '@/entities/bls-http-workflow'
import { formatDateTime } from '@/shared/lib'
import { Btn, Card, Empty } from '@/shared/ui'
import { BlsHttpWorkflowBookingHandoffRender } from './BlsHttpWorkflowBookingHandoffRender'
import { BlsHttpWorkflowEventsFeedRender } from './BlsHttpWorkflowEventsFeedRender'
import { BlsHttpWorkflowStepRailRender } from './BlsHttpWorkflowStepRailRender'
import { BlsHttpWorkflowTaskListRender } from './BlsHttpWorkflowTaskListRender'
import { BLS_WORKFLOW_PANEL_COPY as copy } from './constants'
import type { BlsHttpWorkflowPanelRenderProps } from './types'

export const BlsHttpWorkflowPanelRender = ({
  loading,
  busy,
  polling,
  error,
  actionError,
  liveStatusText,
  snapshot,
  events,
  applicants,
  currentTaskId,
  currentAttempt,
  safeError,
  needsPortalPassword,
  credPassword,
  credBusy,
  credError,
  credSaved,
  onCredPasswordChange,
  onSavePortalPassword,
  retryableTaskIds,
  canStart,
  canStartSupersede,
  startFormBlocked,
  canRetry,
  canResume,
  canPause,
  canCancel,
  onStart,
  onStartSupersede,
  onRetry,
  onRetryTask,
  onResume,
  onPause,
  onCancel,
  onAutofillRunLinked,
}: BlsHttpWorkflowPanelRenderProps) => {
  /**
   * Start stays clickable while the form has Start-gate errors so «Запустить»
   * always runs a full form check (Dialog + field chrome) before any API call.
   * Only busy blocks the control; `startFormBlocked` surfaces a hint only.
   */
  const startDisabled = busy

  return (
    <Card className="mb-5 lg:col-span-2">
      <p className="mb-1 font-bold">{copy.title}</p>
      <p className="mb-4 text-xs text-muted">{copy.hint}</p>

      {/* Polite live region for poll / status / empty / error (NFR-004). */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {liveStatusText}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {canStart ? (
          <Btn disabled={startDisabled} onClick={onStart}>
            {busy ? copy.busy : copy.start}
          </Btn>
        ) : null}
        {canStartSupersede ? (
          <Btn disabled={startDisabled} onClick={onStartSupersede}>
            {busy ? copy.busy : copy.startSupersede}
          </Btn>
        ) : null}
        {canRetry ? (
          <Btn variant="soft" disabled={busy} onClick={onRetry}>
            {copy.retry}
          </Btn>
        ) : null}
        {canResume ? (
          <Btn variant="soft" disabled={busy} onClick={onResume}>
            {copy.resume}
          </Btn>
        ) : null}
        {canPause ? (
          <Btn variant="soft" disabled={busy} onClick={onPause}>
            {copy.pause}
          </Btn>
        ) : null}
        {canCancel ? (
          <Btn variant="danger" disabled={busy} onClick={onCancel}>
            {copy.cancel}
          </Btn>
        ) : null}
        {polling ? (
          <span className="text-xs text-muted" aria-hidden="true">
            {copy.polling}
          </span>
        ) : null}
      </div>

      {startFormBlocked && (canStart || canStartSupersede) ? (
        <p className="mb-3 text-xs font-semibold text-clay">
          {copy.startFormBlockedHint}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-3 text-sm font-semibold text-clay">{actionError}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">{copy.loading}</p>
      ) : null}
      {!loading && error ? (
        <p className="text-sm font-semibold text-clay">{error}</p>
      ) : null}
      {!loading && !error && snapshot == null ? (
        <Empty title={copy.emptyTitle} text={copy.emptyText} />
      ) : null}

      {!loading && !error && snapshot != null ? (
        <div className="space-y-4">
          {snapshot.status === BLS_WORKFLOW_STATUS.AWAITING_STAFF_BOOKING ? (
            <BlsHttpWorkflowBookingHandoffRender
              terminalReason={snapshot.terminalReason}
            />
          ) : null}

          <div className="grid gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm sm:grid-cols-2">
            <p>
              <span className="font-semibold text-muted">{copy.status}: </span>
              <span className="font-bold">{blsWorkflowStatusLabel(snapshot.status)}</span>
            </p>
            <p>
              <span className="font-semibold text-muted">
                {/* lockHeld boolean only — never lockOwner / vault (REQ-016). */}
                {snapshot.lockHeld ? copy.lockHeld : copy.noLock}
              </span>
            </p>
            {snapshot.status === BLS_WORKFLOW_STATUS.PAUSED &&
            snapshot.lockHeld ? (
              <p className="sm:col-span-2 text-xs text-muted">
                {copy.pauseCooperativeHint}
              </p>
            ) : null}
            <p>
              <span className="font-semibold text-muted">{copy.currentStep}: </span>
              {snapshot.currentStepKey
                ? blsWorkflowStepKeyLabel(snapshot.currentStepKey)
                : copy.dash}
            </p>
            <p>
              <span className="font-semibold text-muted">{copy.currentTask}: </span>
              {snapshot.currentTaskKey
                ? blsWorkflowTaskKeyLabel(snapshot.currentTaskKey)
                : copy.dash}
            </p>
            <p>
              <span className="font-semibold text-muted">{copy.attempt}: </span>
              {currentAttempt != null ? currentAttempt : copy.dash}
            </p>
            <p>
              <span className="font-semibold text-muted">{copy.nextRunAt}: </span>
              {snapshot.nextRunAt ? formatDateTime(snapshot.nextRunAt) : copy.dash}
            </p>
            {snapshot.terminalReason ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-muted">
                  {copy.terminalReason}:{' '}
                </span>
                {snapshot.terminalReason}
              </p>
            ) : null}
            {safeError ? (
              <p className="sm:col-span-2 font-semibold text-clay">
                <span className="text-muted">{copy.lastError}: </span>
                {safeError.errorMessage ?? safeError.errorClass ?? copy.dash}
                {safeError.errorClass && safeError.errorMessage
                  ? ` (${safeError.errorClass})`
                  : ''}
              </p>
            ) : null}
            {needsPortalPassword ? (
              <div className="sm:col-span-2 rounded-md border border-amber-300 bg-amber-50 p-3">
                <p className="mb-2 text-sm text-amber-900">
                  Портал-аккаунт для этой заявки уже существует (один аккаунт на
                  паспорт). Введите пароль портала, чтобы флоу продолжил через
                  существующий аккаунт.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="w-64 rounded border border-amber-300 bg-white px-2 py-1 text-sm"
                    placeholder="Пароль портала"
                    value={credPassword}
                    disabled={credBusy}
                    onChange={(e) => onCredPasswordChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded bg-amber-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                    disabled={credBusy || credPassword.trim().length < 8}
                    onClick={onSavePortalPassword}
                  >
                    {credBusy ? 'Сохраняем…' : 'Сохранить и продолжить'}
                  </button>
                  {credSaved ? (
                    <span className="text-sm text-emerald-700">
                      Пароль сохранён — задача перезапущена
                    </span>
                  ) : null}
                  {credError ? (
                    <span className="text-sm text-clay">{credError}</span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <BlsHttpWorkflowStepRailRender
            steps={snapshot.steps}
            currentStepKey={snapshot.currentStepKey}
          />

          <BlsHttpWorkflowTaskListRender
            tasks={snapshot.tasks}
            currentTaskId={currentTaskId}
            applicants={applicants}
            busy={busy}
            retryableTaskIds={retryableTaskIds}
            onRetryTask={onRetryTask}
          />

          <BlsHttpWorkflowEventsFeedRender
            events={events}
            onAutofillRunLinked={onAutofillRunLinked}
          />
        </div>
      ) : null}
    </Card>
  )
}
