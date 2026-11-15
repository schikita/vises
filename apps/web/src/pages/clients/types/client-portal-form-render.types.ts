import type { ReactNode } from 'react'

export type ClientPortalFormRenderProps = {
  detailPath: string
  loading: boolean
  loadError: string
  title: string
  form: ReactNode
}
