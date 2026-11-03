import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DATE_RANGE_PICKER_HEADER_CAPTION_CLASS,
  DATE_RANGE_PICKER_HEADER_CLASS,
  DATE_RANGE_PICKER_HEADER_NAV_CLASS,
  DATE_RANGE_PICKER_VIEW_MODE,
} from './date-range-picker.constants'
import type { DateRangePickerHeaderProps } from './date-range-picker.types'
import { formatCaptionLabel } from './format-caption-label.util'

export const DateRangePickerHeader = (
  props: DateRangePickerHeaderProps,
): React.ReactElement => {
  const {
    viewMode,
    displayMonth,
    yearPageStart,
    yearPageSize,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    onCaptionClick,
  } = props
  const label = formatCaptionLabel(
    viewMode,
    displayMonth,
    yearPageStart,
    yearPageSize,
  )
  const captionInteractive = viewMode !== DATE_RANGE_PICKER_VIEW_MODE.Years

  return (
    <div className={DATE_RANGE_PICKER_HEADER_CLASS}>
      <button
        type="button"
        className={DATE_RANGE_PICKER_HEADER_NAV_CLASS}
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>
      {captionInteractive ? (
        <button
          type="button"
          className={DATE_RANGE_PICKER_HEADER_CAPTION_CLASS}
          onClick={onCaptionClick}
          aria-label={`Select year, currently ${label}`}
        >
          {label}
        </button>
      ) : (
        <span className={DATE_RANGE_PICKER_HEADER_CAPTION_CLASS}>{label}</span>
      )}
      <button
        type="button"
        className={DATE_RANGE_PICKER_HEADER_NAV_CLASS}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  )
}
