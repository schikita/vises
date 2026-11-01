import type { ReactNode } from 'react'

export type SettingsRenderProps = {
  loading: boolean
  loadError: string
  priceForm: ReactNode
  currentPrice: string | null
}
