/**
 * True when Mail.tm mailbox must be retained after registration OTP success
 * (REQ-016 / DEC-007). Delete remains for failure / persist-hard-fail paths;
 * terminal cleanup is TASK-018.
 */
export const shouldRetainMailTmMailboxAfterOtp = (
  emailOtpOk: boolean | undefined,
  mailboxCreated: boolean,
): boolean => mailboxCreated && emailOtpOk === true;
