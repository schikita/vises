import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

type DialogProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export const Dialog = ({ open, title, onClose, children }: DialogProps) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#121814]/45"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-[0_12px_40px_rgba(18,24,20,0.18)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="dialog-title" className="text-lg font-extrabold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1 text-muted hover:bg-[#f7f4ee] hover:text-ink"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
