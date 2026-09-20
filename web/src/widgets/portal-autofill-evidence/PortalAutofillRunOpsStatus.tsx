import {
  formatPortalFillSummaryRu,
  listPortalPassedPipelineStageLabels,
  portalCaptchaCbStateLabel,
  portalPipelineStageLabel,
  portalRunStatusLabel,
} from '@/entities/portal-autofill'
import type { PortalAutofillRunListItem } from '@/entities/portal-autofill'

type PortalAutofillRunOpsStatusProps = {
  run: PortalAutofillRunListItem
}

export const PortalAutofillRunOpsStatus = ({ run }: PortalAutofillRunOpsStatusProps) => {
  const passed = listPortalPassedPipelineStageLabels(run.pipelineStage)
  const stopLabel =
    run.status === 'in_progress'
      ? portalPipelineStageLabel(run.pipelineStage)
      : run.terminalReason
        ? run.terminalReason
        : portalPipelineStageLabel(run.pipelineStage)

  return (
    <div className="mt-2 space-y-1 border-t border-line pt-2 text-sm">
      <p>
        <span className="text-muted">Статус запуска: </span>
        <span className="font-semibold">{portalRunStatusLabel(run.status)}</span>
      </p>
      <p>
        <span className="text-muted">Текущий этап: </span>
        <span className="font-semibold">{portalPipelineStageLabel(run.pipelineStage)}</span>
      </p>
      {passed.length > 0 ? (
        <p className="text-xs text-muted">Пройдено: {passed.join(' → ')}</p>
      ) : null}
      {run.status !== 'in_progress' && (run.terminalReason || run.pipelineStage) ? (
        <p>
          <span className="text-muted">Остановка: </span>
          <span className="font-semibold">{stopLabel}</span>
        </p>
      ) : null}
      {run.terminalReason ? (
        <p className="text-xs font-semibold text-clay">Причина: {run.terminalReason}</p>
      ) : null}
      {run.fieldProgressSummary ? (
        <p className="text-xs text-muted">
          {formatPortalFillSummaryRu(run.fieldProgressSummary)}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        Капча CB: {portalCaptchaCbStateLabel(run.captcha.cbState)}
        {run.captcha.permanentFailed ? ' · постоянный сбой CapMonster' : ''}
        {run.captcha.budgetExhausted ? ' · бюджет Verified исчерпан' : ''}
      </p>
    </div>
  )
}
