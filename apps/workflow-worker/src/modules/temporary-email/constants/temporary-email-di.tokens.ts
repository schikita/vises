/**
 * Nest DI Symbol tokens for TemporaryEmailProvider / MailPort (DEC-007 / DEC-015).
 * Both tokens resolve to the bound mail adapter; prefer TEMPORARY_EMAIL_PROVIDER.
 */
export const TEMPORARY_EMAIL_PROVIDER = Symbol('TEMPORARY_EMAIL_PROVIDER');
/** Legacy alias token — same adapter as TEMPORARY_EMAIL_PROVIDER. */
export const DISPOSABLE_EMAIL = Symbol('DISPOSABLE_EMAIL');
/** Purpose alias token (DEC-015); same binding as TEMPORARY_EMAIL_PROVIDER. */
export const MAIL_PROVIDER = Symbol('MAIL_PROVIDER');
