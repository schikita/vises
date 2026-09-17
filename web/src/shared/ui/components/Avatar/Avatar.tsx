import { initials } from '@/shared/lib'

export const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-forest text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials(name) || '—'}
    </div>
  )
}
