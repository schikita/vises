import {
  emptyApplicant,
  type UpsertAppResult,
} from '@/entities/application'
import {
  patchClientPassport,
  patchClientPortalForm,
} from '@/entities/client'
import { PORTAL_SAVE_ALL_STEPS } from '../constants/portal-save-all-steps.constants'
import type {
  PortalSaveAllCreateResult,
  RunPortalSaveAllCreateInput,
} from '../types/run-portal-save-all-create.types'
import { formatPortalSaveAllStepError } from './format-portal-save-all-step-error.util'
import { mapPortalFormValuesToApplicationUpsertFields } from './map-portal-form-values-to-application-upsert-fields.util'
import { mapPortalFormValuesToPassportUpdate } from './map-portal-form-values-to-passport-update.util'
import { mapPortalFormValuesToPortalFormUpdate } from './map-portal-form-values-to-portal-form-update.util'

/**
 * Create Save-all (**DEC-PF-011**):
 * apps upsert (with selected clientId, or omit so API creates Client) →
 * passport PATCH → portal-form PATCH → apps upsert refresh.
 * Fail closed; report which step failed. Never logs field values.
 * Does not call agent-only POST /clients. Never invents synthetic clientId.
 */
export const runPortalSaveAllCreate = async (
  input: RunPortalSaveAllCreateInput,
): Promise<PortalSaveAllCreateResult> => {
  const { values, draftApplication, upsert } = input
  const clientEmail = (values.clientEmail ?? '').trim()
  const booking = mapPortalFormValuesToApplicationUpsertFields(values)
  const selectedClientId = input.selectedClientId?.trim() ?? ''

  // applicants[] only for ensureClientForIdentity display name — not portal SoT.
  const nameApplicant = {
    ...emptyApplicant('Self'),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    lastNameAtBirth: values.lastNameAtBirth.trim(),
    dob: values.dob.trim(),
    gender: values.gender === 'male' ? ('male' as const) : ('female' as const),
  }

  let saved: UpsertAppResult
  try {
    saved = await upsert({
      ...draftApplication,
      ...booking,
      // Empty → API creates CRM Client + debit; non-empty → attach Application only.
      clientId: selectedClientId,
      clientEmail,
      applicants: [nameApplicant],
      portalWorkflowAction: 'none',
    })
  } catch (cause) {
    return {
      ok: false,
      step: PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate,
      message: formatPortalSaveAllStepError(
        PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate,
        cause,
      ),
    }
  }

  const clientId = saved.clientId?.trim()
  if (!clientId) {
    return {
      ok: false,
      step: PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate,
      message: formatPortalSaveAllStepError(
        PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate,
        new Error('реальный clientId отсутствует в ответе AppOut'),
      ),
    }
  }

  if (selectedClientId && clientId !== selectedClientId) {
    return {
      ok: false,
      step: PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate,
      message: formatPortalSaveAllStepError(
        PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate,
        new Error('clientId в ответе не совпал с выбранным клиентом'),
      ),
    }
  }

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

  try {
    saved = await upsert({
      ...saved,
      ...booking,
      clientId,
      clientEmail,
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

  return { ok: true, saved }
}
