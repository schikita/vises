import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DIALOG_CLOSE_BUTTON_CLASS,
  DIALOG_PANEL_CLASS,
} from './dialog.constants'
import type { DialogProps } from './dialog.types'

export const Dialog = (props: DialogProps): React.ReactElement | null => {
  const { open, title, onClose, children, closeAriaLabel: closeAriaLabelProp } = props
  const { t } = useTranslation()
  const closeAriaLabel = closeAriaLabelProp ?? t('chrome.dialog.closeAriaLabel')

  useEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return (): void => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-text-primary/40"
        aria-label={closeAriaLabel}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={DIALOG_PANEL_CLASS}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id="dialog-title"
            className="text-lg font-semibold tracking-tight text-text-primary"
          >
            {title}
          </h2>
          <button
            type="button"
            className={DIALOG_CLOSE_BUTTON_CLASS}
            aria-label={closeAriaLabel}
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
