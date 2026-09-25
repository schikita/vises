/** Nest DI Symbol tokens for façade ports. */
export const PORTAL_AUTOFILL = Symbol('PORTAL_AUTOFILL');

export { BLS_WORKFLOW_TASK_EXECUTOR } from '../../bls-workflow';

export {
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from '../../portal-core';

/** Form filler token owned by portal-fill (DEC-004). */
export { PORTAL_FORM_FILLER } from '../../portal-fill';
