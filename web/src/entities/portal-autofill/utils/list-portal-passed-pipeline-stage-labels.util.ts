import { PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER } from '../constants'
import { portalPipelineStageLabel } from './portal-pipeline-stage-label.util'

/**
 * Stages before the current checkpoint (REQ-006 “stages already passed”).
 * Unknown / missing stage → empty list.
 */
export const listPortalPassedPipelineStageLabels = (
  currentStage: string | null,
): string[] => {
  if (currentStage == null || currentStage === '') return []
  const idx = (PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER as readonly string[]).indexOf(
    currentStage,
  )
  if (idx <= 0) return []
  return PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER.slice(0, idx).map((stage) =>
    portalPipelineStageLabel(stage),
  )
}
