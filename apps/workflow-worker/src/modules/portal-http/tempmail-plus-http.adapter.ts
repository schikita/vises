/**
 * tempmail.plus HTTP adapter — replaces the patchright BrowserMailAdapter.
 * Public inbox API: GET /api/mails?email=<local%40domain>&limit=20&epin=
 * and GET /api/mails/<id>?email=...&epin= (verified against the live UI).
 * OTP/password extraction reuses the pure temporary-email utils.
 */
import { Injectable, Logger } from '@nestjs/common';
import {
  TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS,
  TEMPORARY_EMAIL_POLL_INTERVAL_MS,
} from '../temporary-email/constants/temporary-email.constants';
import { extractTemporaryEmailOtp, extractTemporaryEmailPortalPassword } from '../temporary-email/utils';
import type {
  CreateTemporaryMailboxInput,
  DeleteTemporaryMailboxInput,
  DeleteTemporaryMailboxResult,
  ExtractTemporaryEmailOtpInput,
  ExtractTemporaryEmailOtpResult,
  ExtractTemporaryEmailPortalPasswordInput,
  ExtractTemporaryEmailPortalPasswordResult,
  TemporaryMailboxAccount,
  WaitTemporaryEmailMessageInput,
  WaitTemporaryEmailMessageResult,
} from '../temporary-email/types/temporary-email.types';
import type { TemporaryEmailProvider } from '../temporary-email/interfaces/temporary-email-provider.interface';
import { randomBytes } from 'node:crypto';

const BASE = 'https://tempmail.plus';
const DOMAIN = 'fexpost.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

type MailListItem = { mail_id: number; subject?: string; from_mail?: string };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

@Injectable()
export class TempMailPlusHttpAdapter implements TemporaryEmailProvider {
  private readonly logger = new Logger(TempMailPlusHttpAdapter.name);
  /** contextKey -> mailbox address (in-process session state, mirrors browser adapter semantics) */
  private readonly sessions = new Map<string, string>();

  async createAccount(input: CreateTemporaryMailboxInput): Promise<TemporaryMailboxAccount> {
    const localPart = `vises${randomBytes(6).toString('hex')}`;
    const address = `${localPart}@${DOMAIN}`;
    this.sessions.set(input.contextKey, address);
    this.logger.log(`mailbox created (http): ${address} [ctx=${input.contextKey}]`);
    return { id: address, address, token: '', password: '' };
  }

  private async listMails(address: string): Promise<MailListItem[]> {
    const res = await fetch(
      `${BASE}/api/mails?email=${encodeURIComponent(address)}&limit=20&epin=`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`tempmail list ${res.status}`);
    const data = (await res.json()) as { mail_list?: MailListItem[] };
    return data.mail_list || [];
  }

  private async fetchBody(address: string, mailId: number): Promise<string> {
    const res = await fetch(
      `${BASE}/api/mails/${mailId}?email=${encodeURIComponent(address)}&epin=`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`tempmail body ${res.status}`);
    // NOTE: the detail endpoint returns fields at the TOP level (text/html),
    // unlike some wrappers that nest them under `mail`.
    const data = (await res.json()) as {
      text?: string;
      html?: string;
      mail?: { text?: string; html?: string };
    };
    return `${data.text || data.mail?.text || ''}\n${data.html || data.mail?.html || ''}`;
  }

  async waitLatestMessage(input: WaitTemporaryEmailMessageInput): Promise<WaitTemporaryEmailMessageResult> {
    const address = input.contextKey; // register client passes workflowId; adapter maps via address param below
    throw new Error('use waitLatestMessageFor instead');
  }

  /** Address-aware wait (HTTP adapter extension used by the HTTP clients). */
  async waitLatestMessageFor(
    address: string,
    options: { timeoutMs?: number; excludeMessageIds?: string[]; subjectPattern?: RegExp } = {},
  ): Promise<WaitLatestEmailMessageResultFor> {
    const timeoutMs = options.timeoutMs ?? TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS;
    const exclude = new Set((options.excludeMessageIds || []).map(String));
    const deadline = Date.now() + timeoutMs;
    let seen = new Set<number>();
    // snapshot existing ids first
    for (const m of await this.listMails(address)) seen.add(m.mail_id);

    while (Date.now() < deadline) {
      await sleep(TEMPORARY_EMAIL_POLL_INTERVAL_MS);
      const list = await this.listMails(address);
      for (const m of list) {
        if (seen.has(m.mail_id) || exclude.has(String(m.mail_id))) continue;
        if (options.subjectPattern && !options.subjectPattern.test(m.subject || '')) continue;
        const body = await this.fetchBody(address, m.mail_id);
        return { messageId: String(m.mail_id), body, subject: m.subject || '' };
      }
    }
    throw new Error(`tempmail: no matching mail within ${timeoutMs}ms for ${address}`);
  }

  /**
   * Fetch the newest EXISTING matching mail (no waiting) — used by recovery
   * paths where the mail already arrived during an earlier failed attempt
   * (e.g. welcome password that outlived the wait timeout).
   */
  async findLatestMessageFor(
    address: string,
    options: { subjectPattern?: RegExp } = {},
  ): Promise<WaitLatestEmailMessageResultFor> {
    const list = (await this.listMails(address)).sort((a, b) => b.mail_id - a.mail_id);
    for (const m of list) {
      if (options.subjectPattern && !options.subjectPattern.test(m.subject || '')) continue;
      const body = await this.fetchBody(address, m.mail_id);
      return { messageId: String(m.mail_id), body, subject: m.subject || '' };
    }
    throw new Error(`tempmail: no matching mail for ${address}`);
  }

  extractOtp(input: ExtractTemporaryEmailOtpInput): ExtractTemporaryEmailOtpResult {
    return extractTemporaryEmailOtp(input);
  }

  extractPortalPassword(
    input: ExtractTemporaryEmailPortalPasswordInput,
  ): ExtractTemporaryEmailPortalPasswordResult {
    return extractTemporaryEmailPortalPassword(input);
  }

  async deleteAccount(input: DeleteTemporaryMailboxInput): Promise<DeleteTemporaryMailboxResult> {
    // tempmail.plus inboxes auto-expire; best-effort no-op (retention policy handles cleanup)
    void input;
    return { ok: true, warnMessage: 'http adapter: inbox left to auto-expire' };
  }

  async disposeSession(contextKey: string): Promise<DeleteTemporaryMailboxResult> {
    void contextKey;
    return { ok: true };
  }
}

export type WaitLatestEmailMessageResultFor = {
  messageId: string;
  body: string;
  subject: string;
};
