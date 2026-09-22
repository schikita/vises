/**
 * Nest DI Symbol tokens for TemporaryEmailProvider (DEC-007).
 * Both tokens resolve to the Mail.tm adapter; prefer TEMPORARY_EMAIL_PROVIDER.
 */
export const TEMPORARY_EMAIL_PROVIDER = Symbol('TEMPORARY_EMAIL_PROVIDER');
/** Legacy alias token — same Mail.tm adapter as TEMPORARY_EMAIL_PROVIDER. */
export const DISPOSABLE_EMAIL = Symbol('DISPOSABLE_EMAIL');
