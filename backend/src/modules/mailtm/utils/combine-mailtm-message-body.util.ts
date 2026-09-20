import type { MailTmMessageDetail } from '../types';

/** Join text/html/intro fields into one body string for OTP extract. */
export const combineMailTmMessageBody = (
  detail: MailTmMessageDetail,
): string => {
  const parts: string[] = [];
  if (detail.text?.trim()) {
    parts.push(detail.text);
  }
  if (Array.isArray(detail.html)) {
    for (const chunk of detail.html) {
      if (chunk?.trim()) {
        parts.push(chunk);
      }
    }
  }
  if (parts.length === 0 && detail.intro?.trim()) {
    parts.push(detail.intro);
  }
  return parts.join('\n');
};
