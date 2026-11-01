import type {
  EntityGoneI18nKey,
  EntityGoneKind,
} from '../types/entity-gone-i18n-key.types'

/** Localized “entity no longer exists” copy after HTTP 404 (AC-19c / FR-19 edge 16). */
export const ENTITY_GONE_I18N_KEYS = {
  client: 'errors.entityGone.client',
  application: 'errors.entityGone.application',
  agent: 'errors.entityGone.agent',
} as const satisfies Record<EntityGoneKind, EntityGoneI18nKey>
