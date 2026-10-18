import { StreamableFile } from '@nestjs/common';
import { Readable } from 'node:stream';
import { HTTP_ACCESS_LOG_BODY_OMISSION_MARKER } from '../constants';
import type {
  HttpBodySummaryResult,
  SummarizeHttpBodyForLogInput,
} from '../types';
import { redactSensitiveObjectFields } from './redact-sensitive-object-fields.util';
import { truncateLogString } from './truncate-log-string.util';

/**
 * Build a safe request/response body summary: redact → serialize → truncate,
 * or emit an omission marker for multipart/binary (REQ-003–006 / DEC-002).
 */
export const summarizeHttpBodyForLog = (
  input: SummarizeHttpBodyForLogInput,
): HttpBodySummaryResult => {
  const { body, contentType, hasMultipartFile } = input;

  if (hasMultipartFile === true) {
    return {
      value: HTTP_ACCESS_LOG_BODY_OMISSION_MARKER,
      truncated: false,
      omitted: true,
    };
  }

  if (
    typeof contentType === 'string' &&
    contentType.toLowerCase().includes('multipart/')
  ) {
    return {
      value: HTTP_ACCESS_LOG_BODY_OMISSION_MARKER,
      truncated: false,
      omitted: true,
    };
  }

  if (body === undefined || body === null) {
    return { value: undefined, truncated: false, omitted: false };
  }

  if (
    Buffer.isBuffer(body) ||
    body instanceof StreamableFile ||
    body instanceof Readable
  ) {
    return {
      value: HTTP_ACCESS_LOG_BODY_OMISSION_MARKER,
      truncated: false,
      omitted: true,
    };
  }

  let toSerialize: unknown = body;

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (trimmed.length === 0) {
      return { value: undefined, truncated: false, omitted: false };
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed !== null && typeof parsed === 'object') {
        toSerialize = redactSensitiveObjectFields(parsed);
      } else {
        const truncated = truncateLogString(body);
        return {
          value: truncated.value,
          truncated: truncated.truncated,
          omitted: false,
        };
      }
    } catch {
      const truncated = truncateLogString(body);
      return {
        value: truncated.value,
        truncated: truncated.truncated,
        omitted: false,
      };
    }
  } else if (typeof body === 'object') {
    toSerialize = redactSensitiveObjectFields(body);
  } else {
    const truncated = truncateLogString(String(body));
    return {
      value: truncated.value,
      truncated: truncated.truncated,
      omitted: false,
    };
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(toSerialize);
  } catch {
    return {
      value: HTTP_ACCESS_LOG_BODY_OMISSION_MARKER,
      truncated: false,
      omitted: true,
    };
  }

  const truncated = truncateLogString(serialized);
  return {
    value: truncated.value,
    truncated: truncated.truncated,
    omitted: false,
  };
};
