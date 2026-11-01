/** Entity kinds that surface a localized “gone” list notice (AC-19c). */
export type EntityGoneKind = 'client' | 'application' | 'agent'

/** i18n key for entity-gone list notices after HTTP 404. */
export type EntityGoneI18nKey = `errors.entityGone.${EntityGoneKind}`
