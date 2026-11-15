import { useTranslation } from 'react-i18next'
import { Btn } from '@/shared/ui'
import type { ClientPortalFormEditFormRenderProps } from '../../types'
import { PortalFormCostSection } from '../PortalFormCostSection'
import { PortalFormEmployerSection } from '../PortalFormEmployerSection'
import { PortalFormEntryPermitSection } from '../PortalFormEntryPermitSection'
import { PortalFormEuFamilySection } from '../PortalFormEuFamilySection'
import { PortalFormFingerprintSection } from '../PortalFormFingerprintSection'
import { PortalFormHomeSection } from '../PortalFormHomeSection'
import { PortalFormInvitingSection } from '../PortalFormInvitingSection'
import { PortalFormMinorSection } from '../PortalFormMinorSection'
import { PortalFormOtherResidenceSection } from '../PortalFormOtherResidenceSection'
import { PortalFormPassportSection } from '../PortalFormPassportSection'
import { PortalFormPersonalSection } from '../PortalFormPersonalSection'
import { PortalFormPreviousVisaSection } from '../PortalFormPreviousVisaSection'
import { PortalFormTravelSection } from '../PortalFormTravelSection'
import { PortalFormTripSection } from '../PortalFormTripSection'

export const ClientPortalFormEditFormRender = ({
  tripDisabled,
  tripDisabledMessage,
  passportError,
  portalFormError,
  tripError,
  saved,
  pending,
  register,
  setValue,
  watch,
  errors,
  onSubmit,
}: ClientPortalFormEditFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const sectionProps = { register, errors, setValue, pending }
  const isMinor = watch('isMinor') === 'true'
  const hasOtherResidenceship = watch('hasOtherResidenceship') === 'true'
  const isVisaIssuedBefore = watch('isVisaIssuedBefore') === 'true'
  const fingerprintStatus = watch('previousFingerPrintStatus')
  const invitingAuthority = watch('blsInvitingAuthority')
  const hasAnyError = Boolean(passportError || portalFormError || tripError)

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <PortalFormPersonalSection {...sectionProps} />
      <PortalFormMinorSection {...sectionProps} enabled={isMinor} />
      <PortalFormPassportSection {...sectionProps} />
      <PortalFormHomeSection {...sectionProps} />
      <PortalFormOtherResidenceSection
        {...sectionProps}
        enabled={hasOtherResidenceship}
      />
      <PortalFormEmployerSection {...sectionProps} />
      <PortalFormTravelSection {...sectionProps} />
      <PortalFormPreviousVisaSection
        {...sectionProps}
        enabled={isVisaIssuedBefore}
      />
      <PortalFormFingerprintSection
        {...sectionProps}
        statusValue={fingerprintStatus}
      />
      <PortalFormEntryPermitSection {...sectionProps} />
      <PortalFormInvitingSection
        {...sectionProps}
        authorityValue={invitingAuthority}
      />
      <PortalFormCostSection {...sectionProps} />
      <PortalFormEuFamilySection {...sectionProps} />
      <PortalFormTripSection
        {...sectionProps}
        tripDisabled={tripDisabled}
        tripDisabledMessage={tripDisabledMessage}
      />
      {passportError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {t('clients.portalForm.passportError', { message: passportError })}
        </p>
      ) : null}
      {portalFormError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {t('clients.portalForm.portalFormError', {
            message: portalFormError,
          })}
        </p>
      ) : null}
      {tripError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {t('clients.portalForm.tripError', { message: tripError })}
        </p>
      ) : null}
      {saved && !hasAnyError ? (
        <p className="text-sm font-medium text-success" role="status">
          {t('clients.portalForm.saved')}
        </p>
      ) : null}
      <Btn type="submit" disabled={pending}>
        {pending
          ? t('clients.portalForm.submitting')
          : t('clients.portalForm.submit')}
      </Btn>
    </form>
  )
}
