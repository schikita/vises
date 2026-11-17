import type { ApplicationStatus } from '@vises/contracts'

export const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  filling: 'bg-[#f4ead4] text-[#8a5a12]',
  draft: 'bg-[#e8eee9] text-forest',
  not_ready_for_appointment: 'bg-[#e7eef8] text-[#2b4f86]',
  ready_for_appointment: 'bg-[#e4f3ea] text-[#1f6b42]',
  booked: 'bg-[#dcefe8] text-leaf',
  declined: 'bg-[#f0e6e4] text-[#7a3b32]',
}
