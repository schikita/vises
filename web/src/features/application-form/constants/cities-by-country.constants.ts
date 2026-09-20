/**
 * Submit cities by country.
 * Belarus is product-locked to Minsk (REQ-021 / DEC-011).
 * Russia cities remain for historical detail display only.
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Belarus: ['Minsk'],
  Russia: [
    'Moscow',
    'St. Petersburg',
    'Yekaterinburg',
    'Rostov-on-Don',
    'Nizhny Novgorod',
    'Samara',
    'Kazan',
    'Novosibirsk',
  ],
}
