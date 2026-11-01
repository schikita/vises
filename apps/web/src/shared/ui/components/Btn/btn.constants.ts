import type { BtnVariant } from './btn.types'

export const BTN_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export const BTN_VARIANT_CLASS: Record<BtnVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  ghost:
    'bg-transparent text-text-primary border border-border hover:bg-accent-subtle',
  danger:
    'border border-transparent bg-accent-subtle text-danger hover:border-danger/40',
  soft: 'border border-transparent bg-accent-subtle text-accent hover:border-accent/30',
}
