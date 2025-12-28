/**
 * Validation Error Logging Utilities
 *
 * Provides structured logging for Zod validation errors with
 * actionable context for debugging.
 *
 * @module shared/lib/validation-logger
 */
import type { ZodError, ZodIssue } from 'zod';

/** Formatted representation of a single validation issue */
export interface FormattedValidationIssue {
  path: string;
  message: string;
  expected?: string;
  received?: string;
  code: string;
}

/** Complete validation error log payload */
export interface ValidationErrorLog {
  errorType: string;
  message: string;
  issueCount: number;
  issues: FormattedValidationIssue[];
  dataSample?: unknown;
  timestamp: string;
}

/**
 * Formats a Zod issue path into a readable string
 * e.g., ['nodes', 5, 'type'] => 'nodes[5].type'
 */
function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return '(root)';

  return path.reduce<string>((acc, segment, index) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`;
    }
    return index === 0 ? segment : `${acc}.${segment}`;
  }, '');
}

/**
 * Extracts a safe data sample for logging
 * Truncates large arrays and deep objects to prevent log bloat
 */
function extractDataSample(data: unknown, maxDepth = 2): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    const sample = data
      .slice(0, 3)
      .map((item) =>
        maxDepth > 0 ? extractDataSample(item, maxDepth - 1) : '[...]'
      );
    if (data.length > 3) {
      sample.push(`... and ${data.length - 3} more items`);
    }
    return sample;
  }

  if (maxDepth <= 0) return '[Object]';

  const result: Record<string, unknown> = {};
  const entries = Object.entries(data);
  entries.slice(0, 10).forEach(([key, value]) => {
    result[key] = extractDataSample(value, maxDepth - 1);
  });
  if (entries.length > 10) {
    result['...'] = `${entries.length - 10} more keys`;
  }
  return result;
}

/**
 * Formats a single Zod issue into a readable structure
 */
function formatIssue(issue: ZodIssue): FormattedValidationIssue {
  const formatted: FormattedValidationIssue = {
    path: formatPath(issue.path),
    message: issue.message,
    code: issue.code,
  };

  // Add type-specific details based on issue code
  // Note: Zod issue types vary - we use type assertions for known fields
  const issueAny = issue as Record<string, unknown>;

  if (issue.code === 'invalid_type') {
    formatted.expected = issueAny.expected as string | undefined;
    // Extract received from message if not directly available
    const match = issue.message.match(/received (\w+)/);
    if (match) {
      formatted.received = match[1];
    }
  } else if (issue.code === 'invalid_enum_value' || issue.code === 'invalid_value') {
    // Zod uses 'values' for enum options
    const values = (issueAny.values || issueAny.options) as string[] | undefined;
    if (values) {
      formatted.expected = `one of: ${values.join(', ')}`;
    }
    // Extract received value from message
    const match = issue.message.match(/["']([^"']+)["']/);
    if (match) {
      formatted.received = match[1];
    }
  } else if (issue.code === 'invalid_union') {
    formatted.message = 'Value did not match any union member';
  }

  return formatted;
}

/**
 * Creates a structured log payload from a Zod error
 */
export function formatValidationError(
  zodError: ZodError,
  rawData?: unknown,
  context?: string
): ValidationErrorLog {
  return {
    errorType: 'DataValidationError',
    message: context || 'Schema validation failed',
    issueCount: zodError.issues.length,
    issues: zodError.issues.map(formatIssue),
    dataSample: rawData ? extractDataSample(rawData) : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logs a validation error with full context to the console
 * Uses console.group for collapsible output in browser DevTools
 */
export function logValidationError(
  zodError: ZodError,
  rawData?: unknown,
  context?: string
): void {
  const payload = formatValidationError(zodError, rawData, context);

  console.group(`[DataValidationError] ${payload.message}`);
  console.error('Timestamp:', payload.timestamp);
  console.error('Total issues:', payload.issueCount);

  console.group('Validation Issues:');
  payload.issues.forEach((issue, index) => {
    console.error(`Issue ${index + 1}:`, {
      path: issue.path,
      message: issue.message,
      code: issue.code,
      ...(issue.expected && { expected: issue.expected }),
      ...(issue.received && { received: issue.received }),
    });
  });
  console.groupEnd();

  if (payload.dataSample) {
    console.group('Data Sample (truncated):');
    console.error(payload.dataSample);
    console.groupEnd();
  }

  console.groupEnd();
}
