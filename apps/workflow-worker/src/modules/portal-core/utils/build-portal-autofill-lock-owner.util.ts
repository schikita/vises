import { uid } from '../../../shared/utils';

/** Opaque executor lock owner token for a portal autofill run (REQ-009 / DEC-007). */
export const buildPortalAutofillLockOwner = (): string => uid('paf-lock');
