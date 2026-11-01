import { Link } from 'react-router-dom'
import type { LogoProps } from './logo.types'

export const Logo = (props: LogoProps): React.ReactElement => {
  const { light = false } = props
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-[15px] font-semibold text-white">
        V
      </span>
      <span
        className={`text-[17px] font-semibold tracking-tight ${light ? 'text-white' : 'text-text-primary'}`}
      >
        Vises
      </span>
    </Link>
  )
}
