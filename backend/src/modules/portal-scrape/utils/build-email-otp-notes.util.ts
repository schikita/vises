import type { BuildEmailOtpNotesInput } from '../types';

/**
 * Autofill report notes for Mail.tm / disposable email OTP outcomes (REQ-011).
 * Includes mail.tm attribution when the disposable path is used.
 * Covers Resend count + circuit-open when observed (DEC-008 / REQ-015).
 * Never include token, password, email body, or raw OTP (NFR-001).
 */
export const buildEmailOtpNotes = (
  input: BuildEmailOtpNotesInput,
): string[] => {
  if (!input.otpPathArmed) {
    return [
      'Email OTP: not armed (need CapMonster key + product OTP enable + MAILTM_API_BASE_URL)',
      'Email source: CRM',
    ];
  }

  const notes: string[] = [
    input.emailFromMailTm
      ? 'Email source: Mail.tm disposable account'
      : 'Email source: CRM mapping (Mail.tm account not created this run)',
  ];

  if (input.emailFromMailTm) {
    notes.push('Disposable email: mail.tm (https://mail.tm)');
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

  if (input.mailTmCircuitOpen === true) {
    notes.push('Mail.tm circuit: open (fail-fast)');
  }

  if (input.accountRetained === true) {
    notes.push(
      'Mail.tm account: retained until terminal cleanup (REQ-016 / DEC-007)',
    );
  } else if (input.accountDeleted === true) {
    notes.push('Mail.tm account: deleted');
  } else if (input.accountDeleteWarn) {
    notes.push(`Mail.tm account: delete soft-fail: ${input.accountDeleteWarn}`);
  } else if (input.emailFromMailTm) {
    notes.push('Mail.tm account: cleanup pending or skipped');
  }

  return notes;
};
