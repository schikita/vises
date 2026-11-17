/** True when a completed request id is older than the latest generation. */
export const isStaleProxy6Preview = (
  requestGeneration: number,
  latestGeneration: number,
): boolean => requestGeneration !== latestGeneration
