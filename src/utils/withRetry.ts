import OpenAI from "openai";

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayInSeconds: number = 1
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable =
        error instanceof OpenAI.RateLimitError ||
        error instanceof OpenAI.APIConnectionError || 
        error instanceof OpenAI.APIConnectionTimeoutError || 
        error instanceof OpenAI.APIError &&
        (error.status === 429 || error.status >= 500); // 429 = Too Many Requests, 5xx = Server Errors

      if (!isRetryable || attempt === retries) {
          throw error;
      }

      const exponentialDelay = Math.pow(2, attempt) * (delayInSeconds * 1000);
      console.warn(`Attempt ${attempt} failed. Retrying in ${exponentialDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, exponentialDelay));
    }
  }

  throw new Error("Unreachable code: This should never be reached due to the loop logic.");
}
