import type { ReactElement } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { isPortalConditionalActive } from '../../utils/is-portal-conditional-active.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormToggleBanner } from '../PortalFormToggleBanner'
import { PortalThemedField } from '../PortalThemedField'

const FIELDS_ID = 'portal-minors-fields'

export const PortalMinorsSection = (): ReactElement => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const isMinorRaw = useWatch({
    control,
    name: 'portalFormConditionals.isMinor',
  })
  const isMinor = isPortalConditionalActive(isMinorRaw)
  const banner = PORTAL_FORM_SECTION_BANNERS.minors
  const fieldError = (path: string): string | undefined =>
    getNestedFormError(errors, path)
  const latin = (
    path:
      | 'portalFormConditionals.minorParentSurname'
      | 'portalFormConditionals.minorParentFirstName'
      | 'portalFormConditionals.minorParentLastName'
      | 'portalFormConditionals.minorParentNationality'
      | 'portalFormConditionals.minorParentAddress',
  ): ReturnType<typeof registerLatinUppercaseField<PortalOnePageFormValues>> =>
    registerLatinUppercaseField(register, setValue, path)

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-minors">
      <div id="portal-section-minors">
        <Controller
          name="portalFormConditionals.isMinor"
          control={control}
          render={({ field }) => (
            <PortalFormToggleBanner
              number={banner.number}
              title={banner.title}
              checkboxId="portal-is-minor"
              controlsId={FIELDS_ID}
              name={field.name}
              checked={isPortalConditionalActive(field.value)}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.checked)}
              inputRef={field.ref}
            />
          )}
        />
      </div>
      {isMinor ? (
        <div className="portal-form-grid" id={FIELDS_ID}>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.minorParentSurname}
            required
            error={fieldError('portalFormConditionals.minorParentSurname')}
          >
            <input
              className="portal-form-control uppercase"
              {...latin('portalFormConditionals.minorParentSurname')}
            />
          </PortalThemedField>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.minorParentFirstName}
            required
            error={fieldError('portalFormConditionals.minorParentFirstName')}
          >
            <input
              className="portal-form-control uppercase"
              {...latin('portalFormConditionals.minorParentFirstName')}
            />
          </PortalThemedField>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.minorParentLastName}
            required
            error={fieldError('portalFormConditionals.minorParentLastName')}
          >
            <input
              className="portal-form-control uppercase"
              {...latin('portalFormConditionals.minorParentLastName')}
            />
          </PortalThemedField>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.minorParentNationality}
            required
            error={fieldError('portalFormConditionals.minorParentNationality')}
          >
            <input
              className="portal-form-control uppercase"
              {...latin('portalFormConditionals.minorParentNationality')}
            />
          </PortalThemedField>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.minorParentAddress}
            required
            error={fieldError('portalFormConditionals.minorParentAddress')}
          >
            <input
              className="portal-form-control uppercase"
              {...latin('portalFormConditionals.minorParentAddress')}
            />
          </PortalThemedField>
        </div>
      ) : null}
    </section>
  )
}
