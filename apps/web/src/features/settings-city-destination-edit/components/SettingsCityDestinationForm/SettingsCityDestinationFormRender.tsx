import { ArrowDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Btn } from '@/shared/ui'
import type { SettingsCityDestinationFormRenderProps } from '../../types'
import { SettingsStringListEditor } from '../SettingsStringListEditor'

export const SettingsCityDestinationFormRender = ({
  apiError,
  saved,
  pending,
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
}: SettingsCityDestinationFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-3 rounded-panel border border-border bg-accent-subtle/40 p-3">
        <p className="text-sm font-semibold text-text-primary">
          {t('settingsCityDestination.sectionLabel')}
        </p>
        <SettingsStringListEditor
          label={t('settingsCityDestination.citiesLabel')}
          values={cities}
          draft={cityDraft}
          placeholder={t('settingsCityDestination.cityPlaceholder')}
          addLabel={t('settingsCityDestination.add')}
          removeLabel={t('settingsCityDestination.remove')}
          error={errors.cities?.message}
          disabled={pending}
          onDraftChange={onCityDraftChange}
          onAdd={onAddCity}
          onRemove={onRemoveCity}
        />
        <p className="flex justify-center text-text-secondary" aria-hidden="true">
          <ArrowDown size={28} strokeWidth={2.25} aria-hidden />
        </p>
        <SettingsStringListEditor
          label={t('settingsCityDestination.destinationsLabel')}
          values={destinations}
          draft={destinationDraft}
          placeholder={t('settingsCityDestination.destinationPlaceholder')}
          addLabel={t('settingsCityDestination.add')}
          removeLabel={t('settingsCityDestination.remove')}
          error={errors.destinations?.message}
          disabled={pending}
          onDraftChange={onDestinationDraftChange}
          onAdd={onAddDestination}
          onRemove={onRemoveDestination}
        />
        <p className="text-xs text-text-secondary">
          {t('settingsCityDestination.hint')}
        </p>
      </div>

      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
      {saved && !apiError ? (
        <p className="text-sm font-medium text-success" role="status">
          {t('settingsCityDestination.saved')}
        </p>
      ) : null}

      <Btn type="submit" disabled={pending}>
        {pending
          ? t('settingsCityDestination.saving')
          : t('settingsCityDestination.submit')}
      </Btn>
    </form>
  )
}
