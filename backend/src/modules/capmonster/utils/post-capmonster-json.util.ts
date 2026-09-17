import { CAPMONSTER_API_BASE_URL } from '../constants';

export const postCapMonsterJson = async <T>(
  path: string,
  body: unknown,
  remainingMs: number,
): Promise<T> => {
  if (remainingMs <= 0) {
    throw new Error('CapMonster request aborted: timeout budget exhausted');
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
      throw new Error(
        `CapMonster HTTP ${res.status} on ${path} (non-2xx; details omitted)`,
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`CapMonster ${path} timed out`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};
