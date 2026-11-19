import type { ReactNode } from 'react'

export type ClientPortalFormRenderProps = {
  detailPath: string
  showClientBackLink: boolean
  loading: boolean
  loadError: string
  title: string
  form: ReactNode
}
