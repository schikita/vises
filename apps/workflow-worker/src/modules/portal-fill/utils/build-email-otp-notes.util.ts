import type { BuildEmailOtpNotesInput } from '../types';

/**
 * Autofill report notes for temporary-mailbox / disposable email OTP outcomes
 * (REQ-011). Capability wording only — concrete provider names stay in adapters.
 * Covers Resend count + circuit-open when observed (DEC-008 / REQ-015).
 * Never include token, password, email body, or raw OTP (NFR-001).
 */
export const buildEmailOtpNotes = (
  input: BuildEmailOtpNotesInput,
): string[] => {
  if (!input.otpPathArmed) {
    return [
      'Email OTP: not armed (need captcha service key + product OTP enable; tempmail_plus only)',
      'Email source: CRM',
    ];
  }

  const notes: string[] = [
    input.emailFromTemporaryMailbox
      ? 'Email source: temporary mailbox disposable account'
      : 'Email source: CRM mapping (temporary mailbox not created this run)',
  ];

  if (input.emailFromTemporaryMailbox) {
    notes.push('Disposable email: temporary mailbox provider');
  }

  if (input.emailOtpOk === true || input.emailOtpTouched) {
    notes.push('Email OTP: filled (value masked)');
  } else if (input.emailOtpAttempted === true) {
    const reason = (input.error ?? 'unknown').trim() || 'unknown';
    notes.push(`Email OTP: failed: ${reason}`);
  } else {
    notes.push('Email OTP: not attempted');
  }

  if (input.emailOtpAttempted === true && input.resendAttempts !== undefined) {
    const attempts = Math.max(0, Math.floor(input.resendAttempts));
    notes.push(`Email OTP Resend attempts: ${attempts}`);
  }

  if (input.mailProviderCircuitOpen === true) {
    notes.push('mail provider circuit: open (fail-fast)');
  }

  if (input.accountRetained === true) {
    notes.push(
      'temporary mailbox: retained until terminal cleanup (REQ-016 / DEC-007)',
    );
  } else if (input.accountDeleted === true) {
    notes.push('temporary mailbox: deleted');
  } else if (input.accountDeleteWarn) {
    notes.push(
      `temporary mailbox: delete soft-fail: ${input.accountDeleteWarn}`,
    );
  } else if (input.emailFromTemporaryMailbox) {
    notes.push('temporary mailbox: cleanup pending or skipped');
  }

  return notes;
};
