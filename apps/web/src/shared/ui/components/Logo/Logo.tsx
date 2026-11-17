import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import type { LogoProps } from './logo.types'

export const Logo = ({ light = false, to }: LogoProps): ReactElement => {
  const className = 'flex items-center gap-2.5 no-underline'
  const mark = (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-[15px] font-extrabold text-[#e8f0ed]">
      V
    </span>
  )
  const label = (
    <span className={`text-[17px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
      Vises
    </span>
  )

  if (to === null) {
    return (
      <span className={className}>
        {mark}
        {label}
      </span>
    )
  }

  return (
    <Link to={to ?? '/'} className={className}>
      {mark}
      {label}
    </Link>
  )
}
