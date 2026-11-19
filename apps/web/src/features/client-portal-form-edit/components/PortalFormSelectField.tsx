import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Field } from '@/shared/ui'
import {
  PORTAL_FORM_SELECT_FIELD_OPTIONS,
  PORTAL_FORM_SELECT_PLACEHOLDER_VALUE,
} from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormSelectFieldProps } from '../types'
import { translatePortalSelectLabel, withUnmatchedSelectOption } from '../utils'

export const PortalFormSelectField = ({
  name,
  label,
  required,
  pending,
  value,
  setValue,
  errors,
}: PortalFormSelectFieldProps): React.ReactElement => {
  const { t, i18n } = useTranslation()
  const { issueMessage } = usePortalFormLabels()
  const errorMessage = issueMessage(errors[name]?.message)
  const options = withUnmatchedSelectOption(
    PORTAL_FORM_SELECT_FIELD_OPTIONS[name],
    value,
  )

  return (
    <Field label={label} required={required} error={errorMessage}>
      <select
        className="field"
        autoComplete="off"
        disabled={pending}
        aria-invalid={Boolean(errors[name])}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
          setValue(name, event.target.value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }}
      >
        <option value={PORTAL_FORM_SELECT_PLACEHOLDER_VALUE}>
          {t('clients.portalForm.selectPlaceholder')}
        </option>
        {options.map(
          (option, index): React.ReactElement => (
            <option key={`${index}:${option.value}`} value={option.value}>
              {translatePortalSelectLabel(i18n.language, option.label)}
            </option>
          ),
        )}
      </select>
    </Field>
  )
}
