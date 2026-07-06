/**
 * Vera — Error Constants
 *
 * Centralized error codes and HTTP status constants.
 * Follows Luna's ERRORS + ERROR_CODES + HTTP pattern.
 *
 * Usage:
 *   import { ERRORS, ERROR_CODES } from '@/lib/errors';
 *   return { error: ERRORS.NOT_FOUND, code: ERROR_CODES.NOT_FOUND };
 */

// ---------------------------------------------------------------------------
// HTTP Status Codes
// ---------------------------------------------------------------------------

export const HTTP = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ---------------------------------------------------------------------------
// Machine-readable error codes
// ---------------------------------------------------------------------------

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  MISSING_PARAM: 'MISSING_PARAM',
  RATE_LIMITED: 'RATE_LIMITED',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  AGENT_UNREACHABLE: 'AGENT_UNREACHABLE',
  EVALUATION_FAILED: 'EVALUATION_FAILED',
  REPUTATION_UNAVAILABLE: 'REPUTATION_UNAVAILABLE',
  DISCOVERY_FAILED: 'DISCOVERY_FAILED',
  REGISTRY_UNREACHABLE: 'REGISTRY_UNREACHABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ---------------------------------------------------------------------------
// Human-readable error messages
// ---------------------------------------------------------------------------

export const ERRORS: Record<string, string> = {
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input. Check the request body.',
  [ERROR_CODES.PAYMENT_REQUIRED]: 'Payment is required for this operation.',
  [ERROR_CODES.MISSING_PARAM]: 'A required parameter is missing.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Try again later.',
  [ERROR_CODES.VERIFICATION_FAILED]: 'Agent verification failed. Invalid Ed25519 signature.',
  [ERROR_CODES.AGENT_UNREACHABLE]: 'Could not reach the target agent.',
  [ERROR_CODES.EVALUATION_FAILED]: 'Agent evaluation encountered an error.',
  [ERROR_CODES.REPUTATION_UNAVAILABLE]: 'Reputation data is not yet available for this agent.',
  [ERROR_CODES.DISCOVERY_FAILED]: 'Agent discovery failed.',
  [ERROR_CODES.REGISTRY_UNREACHABLE]: 'Could not reach the agent registry.',
  [ERROR_CODES.INTERNAL_ERROR]: 'An internal error occurred.',
};
