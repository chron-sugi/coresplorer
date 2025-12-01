/**
 * KO Explorer Errors
 *
 * Structured error classes used by the KO Explorer feature to provide
 * richer error context during fetch and validation operations.
 *
 * @module features/ko-explorer/lib/ko-explorer.errors
 */

export class KODataFetchError extends Error {
    cause?: unknown;
    url?: string;
    
    constructor(
        message: string,
        cause?: unknown,
        url?: string
    ) {
        super(message);
        this.name = 'KODataFetchError';
        this.cause = cause;
        this.url = url;
    }
}

export class KODataValidationError extends Error {
    cause?: unknown;
    data?: unknown;
    
    constructor(
        message: string,
        cause?: unknown,
        data?: unknown
    ) {
        super(message);
        this.name = 'KODataValidationError';
        this.cause = cause;
        this.data = data;
    }
}
