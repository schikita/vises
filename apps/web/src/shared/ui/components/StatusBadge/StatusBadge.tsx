import type { Status } from '@/entities/application'

const STATUS_BADGE_CLASS: Record<Status, string> = {
  new: 'bg-[#e8eee9] text-forest',
  docs: 'bg-[#e7eef8] text-[#2b4f86]',
  review: 'bg-[#f4ead4] text-[#8a5a12]',
  ready: 'bg-[#e4f3ea] text-[#1f6b42]',
  booked: 'bg-[#dcefe8] text-leaf',
  done: 'bg-[#e7f6ed] text-[#146c3a]',
  fixes: 'bg-[#fbe7e0] text-clay',
  autofill_ok: 'bg-[#e4f3ea] text-[#1f6b42]',
  autofill_failed: 'bg-[#fbe7e0] text-clay',
  declined: 'bg-[#f0e6e4] text-[#7a3b32]',
}

export const StatusBadge = ({ status, label }: { status: Status; label: string }) => {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASS[status]}`}>
      {label}
    </span>
  )
}
