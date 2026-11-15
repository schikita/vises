import type { ChangeEvent, Ref } from 'react'

export type PortalFormToggleBannerProps = {
  number: number
  title: string
  checkboxId: string
  checked: boolean
  name: string
  onBlur: () => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  inputRef?: Ref<HTMLInputElement>
  controlsId: string
}
