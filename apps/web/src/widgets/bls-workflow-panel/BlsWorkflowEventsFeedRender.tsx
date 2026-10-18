import { useState } from 'react'
import {
  BLS_WORKFLOW_EVENT_TYPE,
  blsWorkflowEventTypeLabel,
  blsWorkflowStepKeyLabel,
  blsWorkflowTaskKeyLabel,
  pickBlsWorkflowPayloadSafeDisplay,
} from '@/entities/bls-workflow'
import { formatDateTime } from '@/shared/lib'
import { Btn } from '@/shared/ui'
import {
  BLS_WORKFLOW_EVENTS_FEED_COMPACT_LIMIT,
  BLS_WORKFLOW_PANEL_COPY as copy,
} from './constants'
import type { BlsWorkflowEventsFeedRenderProps } from './types'

export const BlsWorkflowEventsFeedRender = ({
  events,
  onAutofillRunLinked,
}: BlsWorkflowEventsFeedRenderProps) => {
  const [expanded, setExpanded] = useState(false)

  const ordered = [...events].sort((a, b) => a.id - b.id)
  const needsExpand = ordered.length > BLS_WORKFLOW_EVENTS_FEED_COMPACT_LIMIT
  const visible =
    expanded || !needsExpand
      ? ordered
      : ordered.slice(ordered.length - BLS_WORKFLOW_EVENTS_FEED_COMPACT_LIMIT)

  return (
    <div>
      <p className="mb-2 text-sm font-bold">{copy.eventsHeading}</p>
      {ordered.length === 0 ? (
        <p className="text-xs text-muted">{copy.eventsEmpty}</p>
      ) : (
        <ul className="space-y-1">
          {visible.map((event) => {
            const payload = pickBlsWorkflowPayloadSafeDisplay(event.payloadSafe)
            const isRunLinked =
              event.eventType === BLS_WORKFLOW_EVENT_TYPE.AUTOFILL_RUN_LINKED
            const runId = payload.runId

            return (
              <li
                key={event.id}
                className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-semibold">
                    {blsWorkflowEventTypeLabel(event.eventType)}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDateTime(event.createdAt)}
                  </span>
                </div>
                {(event.stepKey || event.taskKey) && (
                  <p className="mt-0.5 text-xs text-muted">
                    {event.stepKey ? (
                      <>
                        {copy.eventsStep}: {blsWorkflowStepKeyLabel(event.stepKey)}
                      </>
                    ) : null}
                    {event.stepKey && event.taskKey ? ' · ' : null}
                    {event.taskKey ? (
                      <>
                        {copy.eventsTask}: {blsWorkflowTaskKeyLabel(event.taskKey)}
                      </>
                    ) : null}
                  </p>
                )}
                {(payload.status ||
                  payload.action ||
                  payload.reason ||
                  payload.taskId ||
                  payload.errorMessage ||
                  payload.errorClass ||
                  payload.errorCode) && (
                  <p className="mt-1 text-xs text-muted">
                    {payload.status ? (
                      <span>
                        {copy.eventsPayloadStatus}: {payload.status}
                      </span>
                    ) : null}
                    {payload.status && payload.action ? ' · ' : null}
                    {payload.action ? (
                      <span>
                        {copy.eventsPayloadAction}: {payload.action}
                      </span>
                    ) : null}
                    {(payload.status || payload.action) && payload.reason
                      ? ' · '
                      : null}
                    {payload.reason ? (
                      <span>
                        {copy.eventsPayloadReason}: {payload.reason}
                      </span>
                    ) : null}
                    {(payload.status || payload.action || payload.reason) &&
                    payload.taskId
                      ? ' · '
                      : null}
                    {payload.taskId ? (
                      <span>
                        {copy.eventsPayloadTaskId}: {payload.taskId}
                      </span>
                    ) : null}
                    {(payload.status ||
                      payload.action ||
                      payload.reason ||
                      payload.taskId) &&
                    (payload.errorMessage ||
                      payload.errorClass ||
                      payload.errorCode)
                      ? ' · '
                      : null}
                    {payload.errorMessage ||
                    payload.errorClass ||
                    payload.errorCode ? (
                      <span>
                        {copy.eventsPayloadError}:{' '}
                        {payload.errorMessage ??
                          payload.errorClass ??
                          payload.errorCode}
                      </span>
                    ) : null}
                  </p>
                )}
                {isRunLinked && runId ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs">
                      <span className="font-semibold text-muted">
                        {copy.eventsRunId}:{' '}
                      </span>
                      <span className="font-mono text-[11px]">{runId}</span>
                    </p>
                    {onAutofillRunLinked ? (
                      <Btn
                        variant="soft"
                        className="text-xs"
                        onClick={() => {
                          void Promise.resolve(onAutofillRunLinked(runId))
                        }}
                      >
                        {copy.eventsRunLinkAction}
                      </Btn>
                    ) : (
                      <p className="text-xs text-muted">{copy.eventsRunLinkHint}</p>
                    )}
                  </div>
                ) : null}
                {isRunLinked && !runId ? (
                  <p className="mt-1 text-xs text-muted">{copy.eventsRunLinkHint}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
      {needsExpand ? (
        <div className="mt-2">
          <Btn variant="soft" className="text-xs" onClick={() => setExpanded((v) => !v)}>
            {expanded ? copy.eventsCollapse : copy.eventsExpand}
          </Btn>
        </div>
      ) : null}
    </div>
  )
}
