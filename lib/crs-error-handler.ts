// AC6: Error Handling and Retry Logic for CRS API

export enum CRSErrorCode {
  AUTHENTICATION_FAILED = "CRS_AUTH_FAILED",
  TIMEOUT = "CRS_TIMEOUT",
  INVALID_REQUEST = "CRS_INVALID_REQUEST",
  NOT_AVAILABLE = "CRS_NOT_AVAILABLE",
  INTERNAL_ERROR = "CRS_INTERNAL_ERROR",
  NETWORK_ERROR = "CRS_NETWORK_ERROR",
}

export class CRSError extends Error {
  code: CRSErrorCode;
  statusCode: number;
  retryable: boolean;
  originalError?: Error;

  constructor(
    code: CRSErrorCode,
    message: string,
    statusCode: number = 500,
    retryable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = "CRSError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

// AC6: Exponential Backoff Retry (3회 재시도)
interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  timeout?: number;
  retryableErrors?: CRSErrorCode[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  timeout: 30000, // 30 seconds (AC6)
  retryableErrors: [
    CRSErrorCode.TIMEOUT,
    CRSErrorCode.NETWORK_ERROR,
    CRSErrorCode.INTERNAL_ERROR,
  ],
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Apply timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new CRSError(
                  CRSErrorCode.TIMEOUT,
                  `Request timeout after ${opts.timeout}ms`,
                  408,
                  true
                )
              ),
            opts.timeout
          )
        ),
      ]);

      // Success - log if retried
      if (attempt > 0) {
        console.log(`[Retry Success] Operation succeeded after ${attempt} retries`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error instanceof CRSError
          ? opts.retryableErrors.includes(error.code)
          : error.name === "TypeError" || error.code === "ECONNREFUSED";

      // If not retryable or max retries reached
      if (!isRetryable || attempt === opts.maxRetries) {
        console.error(`[Retry Failed] Max retries (${opts.maxRetries}) reached or non-retryable error`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${delay}ms...`,
        error.message
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// AC6: Circuit Breaker Pattern
class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        console.log("[Circuit Breaker] Transitioning to HALF_OPEN state");
        this.state = "HALF_OPEN";
      } else {
        throw new CRSError(
          CRSErrorCode.INTERNAL_ERROR,
          "Circuit breaker is OPEN. Service temporarily unavailable.",
          503,
          false
        );
      }
    }

    try {
      const result = await fn();

      // Success - reset circuit breaker
      if (this.state === "HALF_OPEN") {
        console.log("[Circuit Breaker] Transitioning to CLOSED state");
        this.state = "CLOSED";
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // Open circuit if threshold reached
      if (this.failureCount >= this.failureThreshold) {
        console.error(
          `[Circuit Breaker] Opening circuit. Failure threshold (${this.failureThreshold}) reached.`
        );
        this.state = "OPEN";

        // AC6: Send alert (mock)
        this.sendAlert();
      }

      throw error;
    }
  }

  private sendAlert() {
    // AC6: Slack/PagerDuty 알림 (mock)
    console.error("[ALERT] Circuit breaker opened! CRS API is experiencing issues.");
    // In production:
    // - Send Slack notification
    // - Create PagerDuty incident
    // - Log to Sentry
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker instance
export const crsCircuitBreaker = new CircuitBreaker();

// AC6: Error logger (Sentry integration)
export function logError(error: Error, context?: Record<string, any>) {
  console.error("[CRS Error]", {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // In production, send to Sentry:
  // Sentry.captureException(error, { extra: context });
}

// Helper: Check if error is retryable
export function isRetryableError(error: any): boolean {
  if (error instanceof CRSError) {
    return error.retryable;
  }

  // Network errors are retryable
  if (error.name === "TypeError" || error.code === "ECONNREFUSED") {
    return true;
  }

  // HTTP 5xx errors are retryable
  if (error.statusCode >= 500 && error.statusCode < 600) {
    return true;
  }

  return false;
}

// Usage example wrapper
export async function withRetryAndCircuitBreaker<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return crsCircuitBreaker.execute(() => retryWithBackoff(fn, options));
}
