import {
  BLS_WORKFLOW_TASK_STATUS,
  blsWorkflowRowStatusLabel,
  blsWorkflowStepKeyLabel,
} from '@/entities/bls-http-workflow'
import { BLS_WORKFLOW_PANEL_COPY as copy } from './constants'
import type { BlsHttpWorkflowStepRailRenderProps } from './types'

export const BlsHttpWorkflowStepRailRender = ({
  steps,
  currentStepKey,
}: BlsHttpWorkflowStepRailRenderProps) => {
  if (steps.length === 0) return null

  const ordered = [...steps].sort((a, b) => a.ordinal - b.ordinal)

  return (
    <div>
      <p className="mb-2 text-sm font-bold">{copy.stepsHeading}</p>
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
        {ordered.map((step, index) => {
          const isCurrent =
            currentStepKey != null && step.stepKey === currentStepKey
          const isFailed = step.status === BLS_WORKFLOW_TASK_STATUS.FAILED
          const isSkipped = step.status === BLS_WORKFLOW_TASK_STATUS.SKIPPED
          const isCompleted = step.status === BLS_WORKFLOW_TASK_STATUS.COMPLETED

          let itemClass = 'border-line bg-white'
          if (isCurrent) {
            itemClass = 'border-forest bg-sand/60 ring-2 ring-forest/30'
          } else if (isFailed) {
            itemClass = 'border-[#e8c4b8] bg-[#fbe7e0]/40'
          } else if (isSkipped) {
            itemClass = 'border-line bg-[#f7f4ef]/80'
          } else if (isCompleted) {
            itemClass = 'border-[#b7d9c4] bg-[#e4f3ea]/50'
          }

          return (
            <li
              key={`${step.ordinal}-${step.stepKey}`}
              className={`relative min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm ${itemClass}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs font-semibold text-muted">
                  {index + 1}.
                </span>
                <span
                  className={isCurrent ? 'font-bold text-forest' : 'font-semibold'}
                >
                  {blsWorkflowStepKeyLabel(step.stepKey)}
                </span>
                {isCurrent ? (
                  <span className="rounded bg-forest/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                    {copy.currentStepBadge}
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-1 text-xs ${
                  isFailed ? 'font-semibold text-clay' : 'text-muted'
                }`}
              >
                {blsWorkflowRowStatusLabel(step.status)}
              </p>
              {step.skipReason ? (
                <p className="mt-1 text-xs text-muted">
                  <span className="font-semibold">{copy.skipReason}: </span>
                  {step.skipReason}
                </p>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
