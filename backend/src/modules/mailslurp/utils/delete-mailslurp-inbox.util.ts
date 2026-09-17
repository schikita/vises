import { MailSlurp } from 'mailslurp-client';
import type {
  DeleteMailSlurpInboxInput,
  DeleteMailSlurpInboxResult,
} from '../types';
import { formatMailSlurpError } from './format-mailslurp-error.util';

/**
 * Best-effort inbox delete after a run (DEC-005). Never throws; soft-fail
 * message must not include the API key (NFR-004).
 */
export const deleteMailSlurpInbox = async (
  input: DeleteMailSlurpInboxInput,
): Promise<DeleteMailSlurpInboxResult> => {
  try {
    const client = new MailSlurp({ apiKey: input.apiKey });
    await client.deleteInbox(input.inboxId);
    return { deleted: true };
  } catch (err) {
    return {
      deleted: false,
      warnMessage: formatMailSlurpError('deleteInbox', err, input.apiKey),
    };
  }
};
