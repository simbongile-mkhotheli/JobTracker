// Shared by Auth and Data API clients. Read the stage signal for each request
// so cleanup can use its own deadline after a failed or cancelled test.
export function boundedFetch(
  stageSignal,
  fetch = globalThis.fetch,
  timeout = 10000,
) {
  return async (url, options = {}) => {
    const signal = AbortSignal.any([
      stageSignal(),
      ...(options.signal ? [options.signal] : []),
      AbortSignal.timeout(timeout),
    ]);
    try {
      signal.throwIfAborted();
      return await fetch(url, { ...options, signal });
    } catch (error) {
      // SDK read retries must not revive a cancelled request during cleanup.
      if (signal.aborted)
        throw new DOMException(
          "Test HTTP request cancelled or timed out",
          "AbortError",
        );
      throw error;
    }
  };
}
