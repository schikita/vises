/**
 * ICAO-style transliteration (Cyrillic → Latin) for portal-facing fields.
 * The portal rejects Cyrillic ("Special characters and numbers are not allowed").
 */
const MAP: Record<string, string> = {
  а: 'A', б: 'B', в: 'V', г: 'G', д: 'D', е: 'E', ё: 'E', ж: 'ZH', з: 'Z', и: 'I',
  й: 'Y', к: 'K', л: 'L', м: 'M', н: 'N', о: 'O', п: 'P', р: 'R', с: 'S', т: 'T',
  у: 'U', ф: 'F', х: 'KH', ц: 'TS', ч: 'CH', ш: 'SH', щ: 'SHCH', ъ: '', ы: 'Y',
  ь: '', э: 'E', ю: 'YU', я: 'YA',
  і: 'I', ў: 'U', '’': '', "'": '',
};

export const transliterate = (input: string): string =>
  input
    .split('')
    .map((ch) => {
      const lower = MAP[ch.toLowerCase()];
      if (lower === undefined) return ch;
      return ch === ch.toLowerCase() ? lower.toLowerCase() : lower;
    })
    .join('')
    .toUpperCase();

export const needsTransliteration = (input: string): boolean =>
  /[а-яёіїў]/i.test(input);
