import type { ChangeEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import { Field } from '@/shared/ui'
import {
  ENTRIES,
  MARITAL_STATUSES,
  PASSPORT_TYPES,
  PURPOSES,
  RELATIONSHIPS,
} from '../../constants'
import type { ApplicantFieldsProps } from '../../types'
import { getNestedFormError, toLatin } from '../../utils'

export const ApplicantFields = ({ namePrefix }: ApplicantFieldsProps) => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  const fieldError = (key: string) => getNestedFormError(errors, `${namePrefix}.${key}`)

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
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Personal details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Relationship" required error={fieldError('relationship')}>
            <select className="field" {...register(`${namePrefix}.relationship`)}>
              {RELATIONSHIPS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Surname" required error={fieldError('lastName')}>
            <input className="field uppercase" {...latinField('lastName')} />
          </Field>
          <Field label="Surname at birth" required error={fieldError('lastNameAtBirth')}>
            <input className="field uppercase" {...latinField('lastNameAtBirth')} />
          </Field>
          <Field label="First name(s)" required error={fieldError('firstName')}>
            <input className="field uppercase" {...latinField('firstName')} />
          </Field>
          <Field label="Other names" error={fieldError('otherNames')}>
            <input className="field uppercase" {...latinField('otherNames')} />
          </Field>
          <Field label="Date of birth" required error={fieldError('dob')}>
            <input type="date" className="field" {...register(`${namePrefix}.dob`)} />
          </Field>
          <Field label="Place of birth" required error={fieldError('placeOfBirth')}>
            <input className="field uppercase" {...latinField('placeOfBirth')} />
          </Field>
          <Field label="Country of birth" required error={fieldError('countryOfBirth')}>
            <input className="field uppercase" {...latinField('countryOfBirth')} />
          </Field>
          <Field label="Current nationality" required error={fieldError('nationality')}>
            <input className="field uppercase" {...latinField('nationality')} />
          </Field>
          <Field label="Nationality at birth" error={fieldError('nationalityAtBirth')}>
            <input className="field uppercase" {...latinField('nationalityAtBirth')} />
          </Field>
          <Field label="Gender" required error={fieldError('gender')}>
            <select className="field" {...register(`${namePrefix}.gender`)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Marital status" required error={fieldError('maritalStatus')}>
            <select className="field" {...register(`${namePrefix}.maritalStatus`)}>
              {MARITAL_STATUSES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="National identity number" error={fieldError('nationalId')}>
            <input className="field uppercase" {...latinField('nationalId')} />
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Travel document</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type of travel document" required error={fieldError('passportType')}>
            <select className="field" {...register(`${namePrefix}.passportType`)}>
              {PASSPORT_TYPES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Number of travel document" required error={fieldError('passportNumber')}>
            <input className="field uppercase" {...latinField('passportNumber')} />
          </Field>
          <Field label="Date of issue" required error={fieldError('passportIssued')}>
            <input type="date" className="field" {...register(`${namePrefix}.passportIssued`)} />
          </Field>
          <Field label="Valid until" required error={fieldError('passportExpires')}>
            <input type="date" className="field" {...register(`${namePrefix}.passportExpires`)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Issued by" required error={fieldError('passportIssuedBy')}>
              <input className="field uppercase" {...latinField('passportIssuedBy')} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={fieldError('email')}>
            <input className="field" type="email" {...register(`${namePrefix}.email`)} />
          </Field>
          <Field label="Telephone" required error={fieldError('phone')}>
            <input
              className="field"
              placeholder="291234567"
              inputMode="numeric"
              {...register(`${namePrefix}.phone`)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Home address" error={fieldError('address')}>
              <input className="field uppercase" {...latinField('address')} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Journey</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purpose of journey" required error={fieldError('purpose')}>
            <select className="field" {...register(`${namePrefix}.purpose`)}>
              {PURPOSES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Member state of first entry" error={fieldError('firstEntry')}>
            <input className="field" {...register(`${namePrefix}.firstEntry`)} />
          </Field>
          <Field label="Number of entries requested" error={fieldError('entries')}>
            <select className="field" {...register(`${namePrefix}.entries`)}>
              {ENTRIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Intended duration of stay (days)" error={fieldError('durationDays')}>
            <input className="field" {...register(`${namePrefix}.durationDays`)} />
          </Field>
        </div>
      </div>
    </div>
  )
}
