/**
 * Shared Error Classes
 *
 * Generic error classes for data fetching and validation operations.
 * Used by entity-level queries to provide structured error context.
 *
 * @module shared/lib/errors
 */

export class DataFetchError extends Error {
  cause?: unknown;
  url?: string;

  constructor(message: string, url?: string, cause?: unknown) {
    super(message);
    this.name = 'DataFetchError';
    this.url = url;
    this.cause = cause;
  }
}

export class DataValidationError extends Error {
  cause?: unknown;
  data?: unknown;

  constructor(message: string, cause?: unknown, data?: unknown) {
    super(message);
    this.name = 'DataValidationError';
    this.cause = cause;
    this.data = data;
  }
}
