import {
  HTTP_ACCESS_LOG_BODY_MAX_CHARS,
  HTTP_ACCESS_LOG_TRUNCATION_MARKER,
} from '../constants';
import type { TruncateLogStringResult } from '../types';

/**
 * Cap a serialized body side at 2048 characters and mark truncation (REQ-006).
 */
export const truncateLogString = (value: string): TruncateLogStringResult => {
  if (value.length <= HTTP_ACCESS_LOG_BODY_MAX_CHARS) {
    return { value, truncated: false };
  }

  const headLength = Math.max(
    0,
    HTTP_ACCESS_LOG_BODY_MAX_CHARS - HTTP_ACCESS_LOG_TRUNCATION_MARKER.length,
  );
  return {
    value: `${value.slice(0, headLength)}${HTTP_ACCESS_LOG_TRUNCATION_MARKER}`,
    truncated: true,
  };
};
