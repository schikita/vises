/**
 * Process-local async mutex: serializes critical sections so overlapping
 * awaits cannot interleave (NFR-002 lease acquire/release).
 */
export const createAsyncMutex = (): (<T>(
  fn: () => Promise<T>,
) => Promise<T>) => {
  let tail: Promise<void> = Promise.resolve();
  return <T>(fn: () => Promise<T>): Promise<T> => {
    const run = tail.then(fn, fn);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
};
