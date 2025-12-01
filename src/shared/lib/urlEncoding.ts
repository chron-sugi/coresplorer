/**
 * URL Parameter Encoding Utilities
 *
 * Functions for encoding and decoding values for use in URL parameters.
 * Handles edge cases like null, undefined, and empty strings gracefully.
 *
 * @module shared/lib/urlEncoding
 */

/**
 * Encodes a value for use in a URL parameter.
 *
 * @param value - The value to encode
 * @returns URL-encoded string, or empty string for null/undefined
 *
 * @example
 * encodeUrlParam('hello world') // 'hello%20world'
 * encodeUrlParam(null) // ''
 */
export function encodeUrlParam(value: string | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  return encodeURIComponent(value);
}

/**
 * Decodes a URL parameter back to its original value.
 *
 * @param value - The URL-encoded value to decode
 * @returns Decoded string, or empty string for null/undefined
 *
 * @example
 * decodeUrlParam('hello%20world') // 'hello world'
 * decodeUrlParam(null) // ''
 */
export function decodeUrlParam(value: string | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Encodes an array of values as a comma-separated URL parameter.
 *
 * @param values - Array of values to encode
 * @returns Comma-separated URL-encoded string
 *
 * @example
 * encodeArrayParam(['foo', 'bar']) // 'foo,bar'
 * encodeArrayParam([]) // ''
 */
export function encodeArrayParam(values: string[]): string {
  if (!values || values.length === 0) {
    return '';
  }
  return values.map(encodeUrlParam).join(',');
}

/**
 * Decodes a comma-separated URL parameter back to an array.
 *
 * @param value - Comma-separated URL-encoded string
 * @returns Array of decoded values
 *
 * @example
 * decodeArrayParam('foo,bar') // ['foo', 'bar']
 * decodeArrayParam('') // []
 */
export function decodeArrayParam(value: string | null | undefined): string[] {
  if (value == null || value === '') {
    return [];
  }
  return value.split(',').map(decodeUrlParam).filter(Boolean);
}
