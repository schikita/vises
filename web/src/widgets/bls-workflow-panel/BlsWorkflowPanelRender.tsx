import {
  blsWorkflowRowStatusLabel,
  blsWorkflowStatusLabel,
  blsWorkflowStepKeyLabel,
  blsWorkflowTaskKeyLabel,
} from '@/entities/bls-workflow'
import { formatDateTime } from '@/shared/lib'
import { Btn, Card, Empty } from '@/shared/ui'
import { BLS_WORKFLOW_PANEL_COPY as copy } from './constants'
import type { BlsWorkflowPanelRenderProps } from './types'

export const BlsWorkflowPanelRender = ({
  loading,
  busy,
  polling,
  error,
  actionError,
  snapshot,
  currentAttempt,
  safeError,
  canStart,
  canStartSupersede,
  canRetry,
  canResume,
  canPause,
  canCancel,
  onStart,
  onStartSupersede,
  onRetry,
  onResume,
  onPause,
  onCancel,
}: BlsWorkflowPanelRenderProps) => {
  return (
    <Card className="mb-5 lg:col-span-2">
      <p className="mb-1 font-bold">{copy.title}</p>
      <p className="mb-4 text-xs text-muted">{copy.hint}</p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {canStart ? (
          <Btn disabled={busy} onClick={onStart}>
            {busy ? copy.busy : copy.start}
          </Btn>
        ) : null}
        {canStartSupersede ? (
          <Btn disabled={busy} onClick={onStartSupersede}>
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
        {polling ? <span className="text-xs text-muted">{copy.polling}</span> : null}
      </div>

      {actionError ? (
        <p className="mb-3 text-sm font-semibold text-clay">{actionError}</p>
      ) : null}

      {loading ? <p className="text-sm text-muted">{copy.loading}</p> : null}
      {!loading && error ? (
        <p className="text-sm font-semibold text-clay">{error}</p>
      ) : null}
      {!loading && !error && snapshot == null ? (
        <Empty title={copy.emptyTitle} text={copy.emptyText} />
      ) : null}

      {!loading && !error && snapshot != null ? (
        <div className="space-y-4">
          <div className="grid gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm sm:grid-cols-2">
            <p>
              <span className="font-semibold text-muted">{copy.status}: </span>
              <span className="font-bold">{blsWorkflowStatusLabel(snapshot.status)}</span>
            </p>
            <p>
              <span className="font-semibold text-muted">
                {snapshot.lockHeld ? copy.lockHeld : copy.noLock}
              </span>
            </p>
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
              {snapshot.nextRunAt
                ? formatDateTime(snapshot.nextRunAt)
                : copy.dash}
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
          </div>

          {snapshot.steps.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-bold">{copy.stepsHeading}</p>
              <ul className="space-y-1">
                {snapshot.steps.map((step) => (
                  <li
                    key={`${step.ordinal}-${step.stepKey}`}
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">
                      {blsWorkflowStepKeyLabel(step.stepKey)}
                    </span>
                    <span className="text-muted">
                      {' '}
                      · {blsWorkflowRowStatusLabel(step.status)}
                    </span>
                    {step.skipReason ? (
                      <span className="text-xs text-muted"> — {step.skipReason}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {snapshot.tasks.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-bold">{copy.tasksHeading}</p>
              <ul className="space-y-1">
                {snapshot.tasks.map((task) => (
                  <li
                    key={`${task.ordinal}-${task.stepKey}-${task.taskKey}-${task.applicantId ?? ''}`}
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">
                      {blsWorkflowTaskKeyLabel(task.taskKey)}
                    </span>
                    <span className="text-muted">
                      {' '}
                      · {blsWorkflowStepKeyLabel(task.stepKey)} ·{' '}
                      {blsWorkflowRowStatusLabel(task.status)} · попытка{' '}
                      {task.attemptCount}
                    </span>
                    {task.lastErrorMessage ? (
                      <p className="mt-1 text-xs font-semibold text-clay">
                        {task.lastErrorMessage}
                        {task.lastErrorClass ? ` (${task.lastErrorClass})` : ''}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
