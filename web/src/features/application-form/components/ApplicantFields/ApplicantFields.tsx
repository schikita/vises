import type { ChangeEvent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Field } from '@/shared/ui'
import {
  BELARUS_PHONE_COUNTRY_CODE,
  BELARUS_PHONE_COUNTRY_LABEL,
  BELARUS_PHONE_PLACEHOLDER,
  ENTRIES,
  MARITAL_STATUSES,
  PASSPORT_TYPES,
  PURPOSES,
  RELATIONSHIPS,
} from '../../constants'
import type { ApplicantFieldsProps } from '../../types'
import {
  formatBelarusLocalPhoneDisplay,
  getNestedFormError,
  parseBelarusLocalPhoneDigits,
  toLatin,
} from '../../utils'

export const ApplicantFields = ({
  namePrefix,
  section = 'all',
}: ApplicantFieldsProps) => {
  const { t } = useTranslation()
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext()

  const fieldError = (key: string) => getNestedFormError(errors, `${namePrefix}.${key}`)
  const showPersonal = section === 'all' || section === 'personal'
  const showDocuments = section === 'all' || section === 'documents'
  const showContactJourney = section === 'all' || section === 'contactJourney'
  const phonePath = `${namePrefix}.phone`

  const latinField = (key: string) => {
    const path = `${namePrefix}.${key}`
    const reg = register(path)
    return {
      ...reg,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const next = toLatin(e.target.value)
        e.target.value = next
        setValue(path, next, { shouldDirty: true, shouldValidate: true })
      },
    }
  }

  return (
    <div className="space-y-6">
      {showPersonal && (
        <div>
          {section === 'all' && (
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
              {t('applicant.sections.personal')}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('applicant.fields.relationship')} required error={fieldError('relationship')}>
              <select className="field" {...register(`${namePrefix}.relationship`)}>
                {RELATIONSHIPS.map((x) => (
                  <option key={x} value={x}>
                    {t(`applicant.options.relationship.${x}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('applicant.fields.lastName')} required error={fieldError('lastName')}>
              <input className="field uppercase" {...latinField('lastName')} />
            </Field>
            <Field
              label={t('applicant.fields.lastNameAtBirth')}
              required
              error={fieldError('lastNameAtBirth')}
            >
              <input className="field uppercase" {...latinField('lastNameAtBirth')} />
            </Field>
            <Field label={t('applicant.fields.firstName')} required error={fieldError('firstName')}>
              <input className="field uppercase" {...latinField('firstName')} />
            </Field>
            <Field label={t('applicant.fields.otherNames')} error={fieldError('otherNames')}>
              <input className="field uppercase" {...latinField('otherNames')} />
            </Field>
            <Field label={t('applicant.fields.dob')} required error={fieldError('dob')}>
              <input type="date" className="field" {...register(`${namePrefix}.dob`)} />
            </Field>
            <Field
              label={t('applicant.fields.placeOfBirth')}
              required
              error={fieldError('placeOfBirth')}
            >
              <input className="field uppercase" {...latinField('placeOfBirth')} />
            </Field>
            <Field
              label={t('applicant.fields.countryOfBirth')}
              required
              error={fieldError('countryOfBirth')}
            >
              <input className="field uppercase" {...latinField('countryOfBirth')} />
            </Field>
            <Field
              label={t('applicant.fields.nationality')}
              required
              error={fieldError('nationality')}
            >
              <input className="field uppercase" {...latinField('nationality')} />
            </Field>
            <Field
              label={t('applicant.fields.nationalityAtBirth')}
              error={fieldError('nationalityAtBirth')}
            >
              <input className="field uppercase" {...latinField('nationalityAtBirth')} />
            </Field>
            <Field label={t('applicant.fields.gender')} required error={fieldError('gender')}>
              <select className="field" {...register(`${namePrefix}.gender`)}>
                <option value="female">{t('applicant.gender.female')}</option>
                <option value="male">{t('applicant.gender.male')}</option>
              </select>
            </Field>
            <Field
              label={t('applicant.fields.maritalStatus')}
              required
              error={fieldError('maritalStatus')}
            >
              <select className="field" {...register(`${namePrefix}.maritalStatus`)}>
                {MARITAL_STATUSES.map((x) => (
                  <option key={x} value={x}>
                    {t(`applicant.options.maritalStatus.${x}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('applicant.fields.nationalId')} error={fieldError('nationalId')}>
              <input className="field uppercase" {...latinField('nationalId')} />
            </Field>
          </div>
        </div>
      )}

      {showDocuments && (
        <div>
          {section === 'all' && (
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
              {t('applicant.sections.travelDocument')}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('applicant.fields.passportType')}
              required
              error={fieldError('passportType')}
            >
              <select className="field" {...register(`${namePrefix}.passportType`)}>
                {PASSPORT_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {t(`applicant.options.passportType.${x}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t('applicant.fields.passportNumber')}
              required
              error={fieldError('passportNumber')}
            >
              <input className="field uppercase" {...latinField('passportNumber')} />
            </Field>
            <Field
              label={t('applicant.fields.passportIssued')}
              required
              error={fieldError('passportIssued')}
            >
              <input type="date" className="field" {...register(`${namePrefix}.passportIssued`)} />
            </Field>
            <Field
              label={t('applicant.fields.passportExpires')}
              required
              error={fieldError('passportExpires')}
            >
              <input type="date" className="field" {...register(`${namePrefix}.passportExpires`)} />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label={t('applicant.fields.passportIssuedBy')}
                required
                error={fieldError('passportIssuedBy')}
              >
                <input className="field uppercase" {...latinField('passportIssuedBy')} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {showContactJourney && (
        <>
          <div>
            {section === 'all' && (
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {t('applicant.sections.contact')}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('applicant.fields.email')} error={fieldError('email')}>
                <input className="field" type="email" {...register(`${namePrefix}.email`)} />
              </Field>
              <Field label={t('applicant.fields.phone')} required error={fieldError('phone')}>
                <div className="flex overflow-hidden rounded-xl border border-line bg-white">
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 border-r border-line bg-[#f6f7f6] px-3 text-sm font-bold text-ink"
                    aria-hidden="true"
                  >
                    <span className="rounded-sm bg-[#009639] px-1 py-0.5 text-[10px] font-extrabold leading-none text-white">
                      {BELARUS_PHONE_COUNTRY_LABEL}
                    </span>
                    {BELARUS_PHONE_COUNTRY_CODE}
                  </span>
                  <Controller
                    name={phonePath}
                    control={control}
                    render={({ field }) => (
                      <input
                        className="field min-w-0 flex-1 rounded-none border-0"
                        placeholder={BELARUS_PHONE_PLACEHOLDER}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        value={formatBelarusLocalPhoneDisplay(
                          parseBelarusLocalPhoneDigits(String(field.value ?? '')),
                        )}
                        onChange={(e) =>
                          field.onChange(parseBelarusLocalPhoneDigits(e.target.value))
                        }
                      />
                    )}
                  />
                </div>
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('applicant.fields.address')} error={fieldError('address')}>
                  <input className="field uppercase" {...latinField('address')} />
                </Field>
              </div>
            </div>
          </div>

          <div>
            {section === 'all' && (
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {t('applicant.sections.journey')}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('applicant.fields.purpose')} required error={fieldError('purpose')}>
                <select className="field" {...register(`${namePrefix}.purpose`)}>
                  {PURPOSES.map((x) => (
                    <option key={x} value={x}>
                      {t(`applicant.options.purpose.${x}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicant.fields.firstEntry')} error={fieldError('firstEntry')}>
                <input className="field" {...register(`${namePrefix}.firstEntry`)} />
              </Field>
              <Field label={t('applicant.fields.entries')} error={fieldError('entries')}>
                <select className="field" {...register(`${namePrefix}.entries`)}>
                  {ENTRIES.map((x) => (
                    <option key={x} value={x}>
                      {t(`applicant.options.entries.${x}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('applicant.fields.durationDays')} error={fieldError('durationDays')}>
                <input className="field" {...register(`${namePrefix}.durationDays`)} />
              </Field>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
