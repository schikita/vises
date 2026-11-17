import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { ENTRIES } from '../../constants/entries.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import { PURPOSES } from '../../constants/purposes.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import type { PortalTravelInformationSectionProps } from '../../types/portal-travel-information-section.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalTravelInformationSection = ({
  hideDestinationField = false,
}: PortalTravelInformationSectionProps): ReactElement => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const banner = PORTAL_FORM_SECTION_BANNERS.travelInformation
  const latin = (path: keyof PortalOnePageFormValues): ReturnType<
    typeof registerLatinUppercaseField<PortalOnePageFormValues>
  > => registerLatinUppercaseField(register, setValue, path)

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-travel">
      <div id="portal-section-travel">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.purposeOfJourney}
          required
          error={fieldError('purpose')}
        >
          <select className="portal-form-control" {...register('purpose')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {PURPOSES.map((purpose) => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
        </PortalThemedField>
        {hideDestinationField ? null : (
          <PortalThemedField
            label={PORTAL_FORM_LABELS.memberStateDestination}
            required
            error={fieldError('destination')}
          >
            <input className="portal-form-control uppercase" {...latin('destination')} />
          </PortalThemedField>
        )}
        <PortalThemedField
          label={PORTAL_FORM_LABELS.memberStateSecondDestination}
          error={fieldError('memberStateSecondDestination')}
        >
          <input
            className="portal-form-control uppercase"
            {...latin('memberStateSecondDestination')}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.memberStateFirstEntry}
          required
          error={fieldError('firstEntry')}
        >
          <input className="portal-form-control uppercase" {...latin('firstEntry')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.numberOfEntriesRequested}
          required
          error={fieldError('entries')}
        >
          <select className="portal-form-control" {...register('entries')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {ENTRIES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.intendedStayDuration}
          required
          error={fieldError('durationDays')}
        >
          <input
            type="number"
            min={0}
            className="portal-form-control"
            {...register('durationDays')}
          />
        </PortalThemedField>
      </div>
    </section>
  )
}
