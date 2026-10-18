/**
 * Serialize async work per contextKey (DEC-003).
 * Chains promises in a shared Map; cleans up when the last waiter finishes.
 */
export const runWithBrowserMailSessionMutex = async <T>(input: {
  mutexes: Map<string, Promise<unknown>>;
  contextKey: string;
  fn: () => Promise<T>;
}): Promise<T> => {
  const key = input.contextKey.trim();
  const previous = input.mutexes.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const current = previous.then(() => gate);
  input.mutexes.set(key, current);

  await previous.catch(() => undefined);
  try {
    return await input.fn();
  } finally {
    release();
    if (input.mutexes.get(key) === current) {
      input.mutexes.delete(key);
    }
  }
};
