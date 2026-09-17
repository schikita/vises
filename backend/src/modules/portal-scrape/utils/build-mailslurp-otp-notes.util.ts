import type { BuildMailSlurpOtpNotesInput } from '../types';

/**
 * Autofill report notes for MailSlurp Email / OTP outcomes (REQ-011).
 * Never include API key, email body, or raw OTP (NFR-004).
 */
export const buildMailSlurpOtpNotes = (
  input: BuildMailSlurpOtpNotesInput,
): string[] => {
  if (!input.otpPathArmed) {
    return [
      'MailSlurp OTP: not armed (need CapMonster + MailSlurp keys)',
      'Email source: CRM',
    ];
  }

  const notes: string[] = [
    input.emailFromMailSlurp
      ? 'Email source: MailSlurp inbox'
      : 'Email source: CRM (MailSlurp armed but override missing)',
  ];

  if (input.mailSlurpOtpOk === true || input.emailOtpTouched) {
    notes.push('MailSlurp OTP: filled (value masked)');
  } else if (input.mailSlurpOtpAttempted === true) {
    const reason = (input.error ?? 'unknown').trim() || 'unknown';
    notes.push(`MailSlurp OTP: failed: ${reason}`);
  } else {
    notes.push('MailSlurp OTP: not attempted');
  }

  if (input.inboxDeleted === true) {
    notes.push('MailSlurp inbox: deleted');
  } else if (input.inboxDeleteWarn) {
    notes.push(`MailSlurp inbox: delete soft-fail: ${input.inboxDeleteWarn}`);
  } else if (input.emailFromMailSlurp) {
    notes.push('MailSlurp inbox: cleanup pending or skipped');
  }

  return notes;
};
