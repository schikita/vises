import { formatProxy6CountryLabel } from './format-proxy6-country-label.util'

/** Sort country codes by localized display name (stable for the select). */
export const sortProxy6CountryCodes = (
  codes: string[],
  locale: string,
): string[] =>
  [...codes].sort((a, b): number =>
    formatProxy6CountryLabel(a, locale).localeCompare(
      formatProxy6CountryLabel(b, locale),
      locale,
      { sensitivity: 'base' },
    ),
  )
