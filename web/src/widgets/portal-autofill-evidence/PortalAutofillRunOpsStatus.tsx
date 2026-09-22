import {
  formatPortalAutofillFailureReason,
  formatPortalFillSummaryRu,
  isPortalAutofillCaptchaOpsRelevant,
  listPortalPassedPipelineStageLabels,
  portalCaptchaCbStateLabel,
  portalPipelineStageLabel,
  portalRunStatusLabel,
} from '@/entities/portal-autofill'
import type { PortalAutofillRunListItem } from '@/entities/portal-autofill'

type PortalAutofillRunOpsStatusProps = {
  run: PortalAutofillRunListItem
}

export const PortalAutofillRunOpsStatus = ({
  run,
}: PortalAutofillRunOpsStatusProps) => {
  const isLive = run.status === 'in_progress'
  const failureRaw = run.terminalReason ?? run.errorNote
  const failureReason =
    !isLive && failureRaw ? formatPortalAutofillFailureReason(failureRaw) : null
  const showCaptcha = isPortalAutofillCaptchaOpsRelevant(run)
  const stageLabel =
    run.pipelineStage && run.pipelineStage !== 'terminal'
      ? portalPipelineStageLabel(run.pipelineStage)
      : null
  const passed = isLive
    ? listPortalPassedPipelineStageLabels(run.pipelineStage)
    : []

  return (
    <div className="mt-2 space-y-1 border-t border-line pt-2 text-sm">
      <p>
        <span className="text-muted">Статус запуска: </span>
        <span className="font-semibold">{portalRunStatusLabel(run.status)}</span>
      </p>

      {isLive ? (
        <>
          <p>
            <span className="text-muted">Текущий этап: </span>
            <span className="font-semibold">
              {portalPipelineStageLabel(run.pipelineStage)}
            </span>
          </p>
          {passed.length > 0 ? (
            <p className="text-xs text-muted">Пройдено: {passed.join(' → ')}</p>
          ) : null}
        </>
      ) : null}

      {!isLive && stageLabel ? (
        <p>
          <span className="text-muted">Остановка на этапе: </span>
          <span className="font-semibold">{stageLabel}</span>
        </p>
      ) : null}

      {failureReason ? (
        <p className="text-sm font-semibold text-clay">{failureReason}</p>
      ) : null}

      {run.fieldProgressSummary ? (
        <p className="text-xs text-muted">
          {formatPortalFillSummaryRu(run.fieldProgressSummary)}
        </p>
      ) : null}

      {showCaptcha ? (
        <p className="text-xs text-muted">
          Капча CB: {portalCaptchaCbStateLabel(run.captcha.cbState)}
          {run.captcha.permanentFailed ? ' · постоянный сбой CapMonster' : ''}
          {run.captcha.budgetExhausted ? ' · бюджет Verified исчерпан' : ''}
        </p>
      ) : null}
    </div>
  )
}
