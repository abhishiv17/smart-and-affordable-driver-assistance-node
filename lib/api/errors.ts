// =============================================================================
// API Error Utilities
// =============================================================================
// Standardized error responses for Route Handlers.
// =============================================================================

import { NextResponse } from 'next/server';

/**
 * Standard error response codes.
 */
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * Create a standardized JSON error response.
 */
export function errorResponse(
  message: string,
  code: string,
  status: number
) {
  return NextResponse.json(
    { message, code, status },
    { status }
  );
}

/**
 * 501 Not Implemented — used for Phase 1 placeholder endpoints.
 */
export function notImplementedResponse(feature: string) {
  return errorResponse(
    `${feature} is not yet implemented. Coming in a future phase.`,
    ERROR_CODES.NOT_IMPLEMENTED,
    501
  );
}

/**
 * 400 Bad Request with validation details.
 */
export function validationErrorResponse(errors: string[]) {
  return NextResponse.json(
    {
      message: 'Validation failed',
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
      errors,
    },
    { status: 400 }
  );
}
