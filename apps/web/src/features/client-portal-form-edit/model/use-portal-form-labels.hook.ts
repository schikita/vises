import { useTranslation } from 'react-i18next'
import { PORTAL_FORM_REQUIRED_MESSAGE } from '../constants'
import type {
  PortalFormField,
  PortalFormFingerprintStatusLabelKey,
  PortalFormInvitingAuthorityLabelKey,
  PortalFormLabels,
  PortalFormSectionId,
} from '../types'

export const usePortalFormLabels = (): PortalFormLabels => {
  const { t } = useTranslation()

  return {
    fieldLabel: (field: PortalFormField): string =>
      t(`clients.portalForm.fields.${field}`),
    sectionLabel: (section: PortalFormSectionId): string =>
      t(`clients.portalForm.sections.${section}`),
    fingerprintStatusLabel: (
      labelKey: PortalFormFingerprintStatusLabelKey,
    ): string => t(`clients.portalForm.fingerprintStatus.${labelKey}`),
    invitingAuthorityLabel: (
      labelKey: PortalFormInvitingAuthorityLabelKey,
    ): string => t(`clients.portalForm.invitingAuthority.${labelKey}`),
    issueMessage: (message: string | undefined): string | undefined =>
      message === PORTAL_FORM_REQUIRED_MESSAGE
        ? t('clients.portalForm.required')
        : message,
  }
}
