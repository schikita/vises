import type { ChangeEvent } from 'react'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

export type LatinRegisterResult = {
  name: string
  onBlur: ReturnType<UseFormRegister<FieldValues>>['onBlur']
  ref: ReturnType<UseFormRegister<FieldValues>>['ref']
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}
