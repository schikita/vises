import type { ReactElement } from 'react'
import { Btn, Field } from '@/shared/ui'
import {
  SETTINGS_CITY_DESTINATION_MAP,
  SETTINGS_SAVE_BUTTON,
} from '../../constants'
import type { SettingsEditFormRenderProps } from '../../types'
import { SettingsStringListEditor } from '../SettingsStringListEditor'

export const SettingsEditFormRender = ({
  saved,
  saving,
  companyRegister,
  priceRegister,
  cities,
  destinations,
  cityDraft,
  destinationDraft,
  errors,
  onCityDraftChange,
  onDestinationDraftChange,
  onAddCity,
  onRemoveCity,
  onAddDestination,
  onRemoveDestination,
  onSubmit,
}: SettingsEditFormRenderProps): ReactElement => {
  const saveLabel = saving
    ? SETTINGS_SAVE_BUTTON.saving
    : saved
      ? SETTINGS_SAVE_BUTTON.saved
      : SETTINGS_SAVE_BUTTON.idle

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field label="Название" error={errors.company?.message}>
        <input className="field" {...companyRegister} />
      </Field>
      <Field label="Цена заявки по умолчанию, ₽" error={errors.price?.message}>
        <input className="field" type="number" {...priceRegister} />
      </Field>

      <div className="space-y-3 rounded-xl border border-line bg-[#fcfaf6] p-3">
        <p className="text-sm font-bold">{SETTINGS_CITY_DESTINATION_MAP.sectionLabel}</p>
        <SettingsStringListEditor
          label={SETTINGS_CITY_DESTINATION_MAP.citiesLabel}
          values={cities}
          draft={cityDraft}
          placeholder={SETTINGS_CITY_DESTINATION_MAP.cityPlaceholder}
          addLabel={SETTINGS_CITY_DESTINATION_MAP.add}
          removeLabel={SETTINGS_CITY_DESTINATION_MAP.remove}
          error={errors.cities?.message}
          onDraftChange={onCityDraftChange}
          onAdd={onAddCity}
          onRemove={onRemoveCity}
        />
        <p className="text-center text-sm font-semibold text-muted" aria-hidden="true">
          {SETTINGS_CITY_DESTINATION_MAP.arrow}
        </p>
        <SettingsStringListEditor
          label={SETTINGS_CITY_DESTINATION_MAP.destinationsLabel}
          values={destinations}
          draft={destinationDraft}
          placeholder={SETTINGS_CITY_DESTINATION_MAP.destinationPlaceholder}
          addLabel={SETTINGS_CITY_DESTINATION_MAP.add}
          removeLabel={SETTINGS_CITY_DESTINATION_MAP.remove}
          error={errors.destinations?.message}
          onDraftChange={onDestinationDraftChange}
          onAdd={onAddDestination}
          onRemove={onRemoveDestination}
        />
        <p className="text-xs text-muted">{SETTINGS_CITY_DESTINATION_MAP.hint}</p>
      </div>

      <p className="text-xs text-muted">
        Прокси портала (Proxy6) включается автоматически при наличии ключа
        PROXY6_API_KEY в окружении сервера. OTP идёт через tempmail.plus на
        workflow-worker. Переключатели на этом экране убраны.
      </p>
      <Btn type="submit" loading={saving}>
        {saveLabel}
      </Btn>
    </form>
  )
}
