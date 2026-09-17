import { Link } from 'react-router-dom'

export const Logo = ({ light = false }: { light?: boolean }) => {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-[15px] font-extrabold text-[#e8f0ed]">
        V
      </span>
      <span className={`text-[17px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        Vises
      </span>
    </Link>
  )
}
