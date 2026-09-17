import { MailSlurp } from 'mailslurp-client';
import type {
  WaitMailSlurpLatestEmailInput,
  WaitMailSlurpLatestEmailResult,
} from '../types';
import { formatMailSlurpError } from './format-mailslurp-error.util';

/**
 * Wait for the latest unread email in a run inbox (REQ-007 / DEC-003).
 * Timeout is bounded by `timeoutMs` (NFR-001).
 */
export const waitMailSlurpLatestEmail = async (
  input: WaitMailSlurpLatestEmailInput,
): Promise<WaitMailSlurpLatestEmailResult> => {
  try {
    if (input.timeoutMs <= 0) {
      throw new Error('timeout budget exhausted');
    }
    const client = new MailSlurp({ apiKey: input.apiKey });
    const unreadOnly = input.unreadOnly !== false;
    const email = await client.waitForLatestEmail(
      input.inboxId,
      input.timeoutMs,
      unreadOnly,
    );
    const emailId = email.id?.trim();
    if (!emailId) {
      throw new Error('waitForLatestEmail returned empty email id');
    }
    return {
      emailId,
      body: email.body ?? '',
    };
  } catch (err) {
    throw new Error(
      formatMailSlurpError('waitForLatestEmail', err, input.apiKey),
    );
  }
};
