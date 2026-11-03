import {
  DATE_RANGE_PICKER_PRESETS_CLASS,
  DATE_RANGE_PICKER_PRESET_BUTTON_CLASS,
  DATE_RANGE_PICKER_PRESET_ORDER,
} from './date-range-picker.constants'
import type {
  DateRangePickerPresetId,
  DateRangePickerPresetLabels,
  DateRangePickerPresetsProps,
} from './date-range-picker.types'

export const DateRangePickerPresets = (
  props: DateRangePickerPresetsProps,
): React.ReactElement => {
  const { labels, onSelectPreset } = props

  return (
    <div
      className={DATE_RANGE_PICKER_PRESETS_CLASS}
      role="group"
      aria-label="Date range presets"
    >
      {DATE_RANGE_PICKER_PRESET_ORDER.map(
        (preset: {
          id: DateRangePickerPresetId
          labelKey: keyof DateRangePickerPresetLabels
        }): React.ReactElement => (
          <button
            key={preset.id}
            type="button"
            className={DATE_RANGE_PICKER_PRESET_BUTTON_CLASS}
            onClick={(): void => {
              onSelectPreset(preset.id)
            }}
          >
            {labels[preset.labelKey]}
          </button>
        ),
      )}
    </div>
  )
}
