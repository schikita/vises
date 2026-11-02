import {
  blsWorkflowRowStatusLabel,
  blsWorkflowStepKeyLabel,
  blsWorkflowTaskKeyLabel,
  resolveBlsHttpWorkflowApplicantLabel,
} from '@/entities/bls-http-workflow'
import { Btn } from '@/shared/ui'
import { BLS_WORKFLOW_PANEL_COPY as copy } from './constants'
import type { BlsHttpWorkflowTaskListRenderProps } from './types'

export const BlsHttpWorkflowTaskListRender = ({
  tasks,
  currentTaskId,
  applicants,
  busy,
  retryableTaskIds,
  onRetryTask,
}: BlsHttpWorkflowTaskListRenderProps) => {
  if (tasks.length === 0) return null

  const ordered = [...tasks].sort((a, b) => a.ordinal - b.ordinal)

  return (
    <div>
      <p className="mb-2 text-sm font-bold">{copy.tasksHeading}</p>
      <ul className="space-y-1">
        {ordered.map((task) => {
          const isCurrent = currentTaskId != null && task.id === currentTaskId
          const canRetryRow = retryableTaskIds.has(task.id)
          const attemptsText =
            task.maxAttempts != null
              ? `${copy.attempt} ${task.attemptCount} ${copy.attemptOf} ${task.maxAttempts}`
              : `${copy.attempt} ${task.attemptCount}`
          const applicantLabel = task.applicantId
            ? resolveBlsHttpWorkflowApplicantLabel(task.applicantId, applicants)
            : null

          let itemClass = 'border-line bg-white'
          if (isCurrent) {
            itemClass = 'border-forest bg-sand/60 ring-2 ring-forest/30'
          } else if (task.lastErrorMessage || task.lastErrorClass) {
            itemClass = 'border-[#e8c4b8] bg-[#fbe7e0]/30'
          }

          return (
            <li
              key={task.id || `${task.ordinal}-${task.stepKey}-${task.taskKey}-${task.applicantId ?? ''}`}
              className={`rounded-lg border px-3 py-2 text-sm ${itemClass}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className={
                        isCurrent ? 'font-bold text-forest' : 'font-semibold'
                      }
                    >
                      {blsWorkflowTaskKeyLabel(task.taskKey)}
                    </span>
                    {isCurrent ? (
                      <span className="rounded bg-forest/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                        {copy.currentTaskBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {blsWorkflowStepKeyLabel(task.stepKey)} ·{' '}
                    {blsWorkflowRowStatusLabel(task.status)} · {attemptsText}
                  </p>
                  {task.applicantId && applicantLabel != null ? (
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-muted">
                        {copy.applicant}:{' '}
                      </span>
                      {applicantLabel === task.applicantId ? (
                        task.applicantId
                      ) : (
                        <>
                          {applicantLabel}
                          <span className="text-muted">
                            {' '}
                            ({task.applicantId})
                          </span>
                        </>
                      )}
                    </p>
                  ) : null}
                  {task.lastErrorMessage || task.lastErrorClass ? (
                    <p className="mt-1 text-xs font-semibold text-clay">
                      <span className="text-muted">{copy.lastError}: </span>
                      {task.lastErrorMessage ?? task.lastErrorClass ?? copy.dash}
                      {task.lastErrorClass && task.lastErrorMessage
                        ? ` (${task.lastErrorClass})`
                        : ''}
                    </p>
                  ) : null}
                </div>
                {canRetryRow ? (
                  <Btn
                    variant="soft"
                    disabled={busy}
                    onClick={() => {
                      onRetryTask(task.id)
                    }}
                  >
                    {copy.retry}
                  </Btn>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
