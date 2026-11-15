import type { ChangeEvent } from 'react'
import type {
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import type { LatinRegisterResult } from '../types/register-latin-uppercase-field.types'
import { toLatin } from './to-latin.util'

/**
 * RHF register wrapper that uppercases Latin input (portal English fields).
 */
export const registerLatinUppercaseField = <TFieldValues extends FieldValues>(
  register: UseFormRegister<TFieldValues>,
  setValue: UseFormSetValue<TFieldValues>,
  path: Path<TFieldValues>,
): LatinRegisterResult => {
  const reg = register(path)
  return {
    name: reg.name,
    onBlur: reg.onBlur,
    ref: reg.ref,
    onChange: (e: ChangeEvent<HTMLInputElement>): void => {
      const next = toLatin(e.target.value)
      e.target.value = next
      setValue(path, next as TFieldValues[typeof path], {
        shouldDirty: true,
        shouldValidate: true,
      })
    },
  }
}
