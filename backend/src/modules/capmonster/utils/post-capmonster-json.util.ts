import { CAPMONSTER_API_BASE_URL } from '../constants';
import { classifyCapMonsterFailure } from './classify-capmonster-failure.util';
import { createCapMonsterClientError } from './create-capmonster-client-error.util';
import { isCapMonsterClientError } from './is-capmonster-client-error.util';

export const postCapMonsterJson = async <T>(
  path: string,
  body: unknown,
  remainingMs: number,
): Promise<T> => {
  const phase = path.startsWith('/') ? path.slice(1) : path;

  if (remainingMs <= 0) {
    throw createCapMonsterClientError({
      message: 'CapMonster request aborted: timeout budget exhausted',
      failureClass: classifyCapMonsterFailure({
        source: 'transport',
        reason: 'timeout_budget',
      }),
      phase,
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), remainingMs);
  try {
    const res = await fetch(`${CAPMONSTER_API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw createCapMonsterClientError({
        message: `CapMonster HTTP ${res.status} on ${path} (non-2xx; details omitted)`,
        failureClass: classifyCapMonsterFailure({
          source: 'http_status',
          httpStatus: res.status,
        }),
        phase,
        httpStatus: res.status,
      });
    }
    return (await res.json()) as T;
  } catch (err) {
    if (isCapMonsterClientError(err)) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw createCapMonsterClientError({
        message: `CapMonster ${path} timed out`,
        failureClass: classifyCapMonsterFailure({
          source: 'transport',
          reason: 'abort',
        }),
        phase,
      });
    }
    const message =
      err instanceof Error ? err.message : 'CapMonster network error';
    throw createCapMonsterClientError({
      message,
      failureClass: classifyCapMonsterFailure({
        source: 'transport',
        reason: 'network',
      }),
      phase,
    });
  } finally {
    clearTimeout(timer);
  }
};
