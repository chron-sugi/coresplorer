/**
 * Custom error classes for the diagram feature.
 * Provides structured error handling with typed error information.
 */

export class DiagramDataFetchError extends Error {
    cause?: unknown;
    url?: string;
    
    constructor(
        message: string,
        cause?: unknown,
        url?: string
    ) {
        super(message);
        this.name = 'DiagramDataFetchError';
        this.cause = cause;
        this.url = url;
    }
}

export class DiagramLayoutError extends Error {
    cause?: unknown;
    
    constructor(
        message: string,
        cause?: unknown
    ) {
        super(message);
        this.name = 'DiagramLayoutError';
        this.cause = cause;
    }
}

export class DiagramValidationError extends Error {
    cause?: unknown;
    data?: unknown;
    
    constructor(
        message: string,
        cause?: unknown,
        data?: unknown
    ) {
        super(message);
        this.name = 'DiagramValidationError';
        this.cause = cause;
        this.data = data;
    }
}
