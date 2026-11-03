import { Link } from 'react-router-dom'
import type { LogoProps } from './logo.types'

export const Logo = (props: LogoProps): React.ReactElement => {
  const { light = false } = props
  return (
    <Link to="/" className="no-underline">
      <span
        className={`text-[17px] font-bold tracking-[0.04em] ${light ? 'text-white' : 'text-text-primary'}`}
      >
        Vises
      </span>
    </Link>
  )
}
