import type { PortalFormControlProps } from '../types'
import {
  isPortalFormDateField,
  isPortalFormPhoneField,
  isPortalFormSelectField,
} from '../utils'
import { PortalFormDateField } from './PortalFormDateField'
import { PortalFormPhoneField } from './PortalFormPhoneField'
import { PortalFormSelectField } from './PortalFormSelectField'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormControl = (
  props: PortalFormControlProps,
): React.ReactElement => {
  if (isPortalFormSelectField(props.name)) {
    return (
      <PortalFormSelectField
        name={props.name}
        label={props.label}
        required={props.required}
        pending={props.pending}
        value={props.watch(props.name)}
        setValue={props.setValue}
        errors={props.errors}
      />
    )
  }

  if (isPortalFormDateField(props.name)) {
    return (
      <PortalFormDateField
        name={props.name}
        label={props.label}
        required={props.required}
        pending={props.pending}
        value={props.watch(props.name)}
        register={props.register}
        setValue={props.setValue}
        errors={props.errors}
      />
    )
  }

  if (isPortalFormPhoneField(props.name)) {
    return (
      <PortalFormPhoneField
        name={props.name}
        label={props.label}
        required={props.required}
        pending={props.pending}
        register={props.register}
        errors={props.errors}
      />
    )
  }

  return (
    <PortalFormTextField
      name={props.name}
      label={props.label}
      required={props.required}
      pending={props.pending}
      register={props.register}
      errors={props.errors}
    />
  )
}
