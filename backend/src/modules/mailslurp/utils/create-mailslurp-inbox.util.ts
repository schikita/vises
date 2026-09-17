import { MailSlurp } from 'mailslurp-client';
import type {
  CreateMailSlurpInboxInput,
  MailSlurpInboxHandle,
} from '../types';
import { formatMailSlurpError } from './format-mailslurp-error.util';

/** Create a unique disposable inbox for one autofill run (REQ-002 / DEC-003). */
export const createMailSlurpInbox = async (
  input: CreateMailSlurpInboxInput,
): Promise<MailSlurpInboxHandle> => {
  try {
    const client = new MailSlurp({ apiKey: input.apiKey });
    const inbox = await client.createInbox();
    const id = inbox.id?.trim();
    const emailAddress = inbox.emailAddress?.trim();
    if (!id || !emailAddress) {
      throw new Error('createInbox returned empty id or emailAddress');
    }
    return { id, emailAddress };
  } catch (err) {
    throw new Error(formatMailSlurpError('createInbox', err, input.apiKey));
  }
};
