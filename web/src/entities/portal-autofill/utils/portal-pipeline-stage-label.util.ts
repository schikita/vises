import { PORTAL_AUTOFILL_PIPELINE_STAGE_LABEL_RU } from '../constants'

/** Russian label for a pipeline stage token; falls back to raw token. */
export const portalPipelineStageLabel = (stage: string | null): string => {
  if (stage == null || stage === '') return '—'
  return PORTAL_AUTOFILL_PIPELINE_STAGE_LABEL_RU[stage] ?? stage
}
