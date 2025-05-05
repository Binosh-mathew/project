interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, delay, backoff } = { ...defaultOptions, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const currentDelay = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  throw lastError;
}

// Example usage:
// const result = await retry(() => api.get('/endpoint'), { maxAttempts: 5, delay: 2000 }); 