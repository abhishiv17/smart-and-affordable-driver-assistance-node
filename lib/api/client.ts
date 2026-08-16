// =============================================================================
// API Client — Frontend HTTP Client
// =============================================================================
// Typed fetch wrapper for calling the SADAN API from client components.
// =============================================================================

/**
 * API error returned from route handlers.
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * Typed fetch wrapper for SADAN API calls.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: {
          message: errorBody.message || response.statusText,
          code: errorBody.code || 'UNKNOWN_ERROR',
          status: response.status,
        },
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        code: 'NETWORK_ERROR',
        status: 0,
      },
    };
  }
}
