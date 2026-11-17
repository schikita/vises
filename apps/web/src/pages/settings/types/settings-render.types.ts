import type { ReactNode } from 'react'

export type SettingsRenderProps = {
  loading: boolean
  loadError: string
  priceForm: ReactNode
  cityDestinationForm: ReactNode
  proxy6Panel: ReactNode
  currentPrice: string | null
  currentCities: string[]
  currentDestinations: string[]
}
