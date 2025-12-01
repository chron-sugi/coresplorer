/**
 * API Types
 *
 * Cross-cutting types for API responses, errors, and pagination.
 * These types have no dependencies on any specific feature or entity.
 *
 * @module types/api
 */

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Standardized API error shape.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Result type for operations that can fail.
 */
export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

// =============================================================================
// PAGINATION
// =============================================================================

/**
 * Pagination parameters for list requests.
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination metadata in responses.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// =============================================================================
// FETCH STATUS
// =============================================================================

/**
 * Status of an async data fetch operation.
 */
export interface FetchStatus {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: ApiError | null;
}
