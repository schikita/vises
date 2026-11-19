import { Plus } from 'lucide-react'
import { Btn } from '@/shared/ui'
import type { ApplicationsEmptyCreateCtaProps } from '../types/applications-empty-create-cta.types'

export const ApplicationsEmptyCreateCta = ({
  to,
  label,
}: ApplicationsEmptyCreateCtaProps): React.ReactElement => {
  return (
    <Btn to={to}>
      <Plus size={16} aria-hidden="true" />
      {label}
    </Btn>
  )
}
