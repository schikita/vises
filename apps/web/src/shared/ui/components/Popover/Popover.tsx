import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react'
import { POPOVER_CONTENT_CLASS } from './popover.constants'
import type { PopoverProps } from './popover.types'

export const Popover = (props: PopoverProps): React.ReactElement => {
  const {
    open,
    onOpenChange,
    trigger,
    children,
    contentClassName = '',
    contentId: contentIdProp,
    contentAriaLabel,
    className = '',
  } = props
  const rootRef = useRef<HTMLDivElement | null>(null)
  const generatedId = useId()
  const contentId = contentIdProp ?? generatedId

  useEffect((): (() => void) | undefined => {
    if (!open) {
      return undefined
    }
    const onPointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return (): void => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  const triggerNode = isValidElement(trigger)
    ? cloneElement(
        trigger as React.ReactElement<{
          'aria-expanded'?: boolean
          'aria-haspopup'?: string
          'aria-controls'?: string
          onClick?: (event: React.MouseEvent) => void
        }>,
        {
          'aria-expanded': open,
          'aria-haspopup': 'dialog',
          'aria-controls': contentId,
          onClick: (event: React.MouseEvent): void => {
            const originalOnClick = (
              trigger.props as {
                onClick?: (event: React.MouseEvent) => void
              }
            ).onClick
            originalOnClick?.(event)
            onOpenChange(!open)
          },
        },
      )
    : trigger

  return (
    <div className={`relative ${className}`.trim()} ref={rootRef}>
      {triggerNode}
      {open ? (
        <div
          id={contentId}
          role="dialog"
          aria-label={contentAriaLabel}
          className={`${POPOVER_CONTENT_CLASS} ${contentClassName}`.trim()}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
