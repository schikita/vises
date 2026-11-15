import {
  patchClientPassport,
  patchClientPortalForm,
} from '@/entities/client'
import { PORTAL_SAVE_ALL_STEPS } from '../constants/portal-save-all-steps.constants'
import type { RunPortalSaveAllDetailInput } from '../types/run-portal-save-all-detail.types'
import type { PortalSaveAllResult } from '../types/portal-save-all-step.types'
import { formatPortalSaveAllStepError } from './format-portal-save-all-step-error.util'
import { mapPortalFormValuesToApplicationUpsertFields } from './map-portal-form-values-to-application-upsert-fields.util'
import { mapPortalFormValuesToPassportUpdate } from './map-portal-form-values-to-passport-update.util'
import { mapPortalFormValuesToPortalFormUpdate } from './map-portal-form-values-to-portal-form-update.util'

/**
 * Detail Save-all: passport PATCH → portal-form PATCH → apps upsert.
 * Fail closed; report which step failed. Never logs field values.
 */
export const runPortalSaveAllDetail = async (
  input: RunPortalSaveAllDetailInput,
): Promise<PortalSaveAllResult> => {
  const { clientId, values, application, upsert } = input

  try {
    await patchClientPassport(clientId, mapPortalFormValuesToPassportUpdate(values))
  } catch (cause) {
    return {
      ok: false,
      step: PORTAL_SAVE_ALL_STEPS.Passport,
      message: formatPortalSaveAllStepError(PORTAL_SAVE_ALL_STEPS.Passport, cause),
    }
  }

  try {
    await patchClientPortalForm(
      clientId,
      mapPortalFormValuesToPortalFormUpdate(values),
    )
  } catch (cause) {
    return {
      ok: false,
      step: PORTAL_SAVE_ALL_STEPS.PortalForm,
      message: formatPortalSaveAllStepError(PORTAL_SAVE_ALL_STEPS.PortalForm, cause),
    }
  }

  const booking = mapPortalFormValuesToApplicationUpsertFields(values)
  try {
    await upsert({
      ...application,
      ...booking,
      // Do not treat applicants[] as SoT for portal-extended fields.
      portalWorkflowAction: 'none',
    })
  } catch (cause) {
    return {
      ok: false,
      step: PORTAL_SAVE_ALL_STEPS.AppsUpsertRefresh,
      message: formatPortalSaveAllStepError(
        PORTAL_SAVE_ALL_STEPS.AppsUpsertRefresh,
        cause,
      ),
    }
  }

  return { ok: true }
}
