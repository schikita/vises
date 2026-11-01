import type { EmptyProps } from './empty.types'

export const Empty = (props: EmptyProps): React.ReactElement => {
  const { title, text } = props
  return (
    <div className="py-16 text-center">
      <p className="text-base font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{text}</p>
    </div>
  )
}
