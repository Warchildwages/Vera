/**
 * Vera — Multi-Chain x402 Payment Verification
 *
 * Payment verification infrastructure for Vera.
 * Vera is currently a free service (all operations price=0),
 * but this module provides the x402 payment layer for future
 * paid operations.
 *
 * Supports:
 *   PAYMENT-SIGNATURE  — Casper x402 (Ed25519 via tweetnacl + CSPR.cloud)
 *   x-402-* headers    — Circle Gateway x402 (multi-chain: Base, Arc, etc.)
 */

// ---------------------------------------------------------------------------
// Protocol Detection
// ---------------------------------------------------------------------------

export type PaymentProtocol = 'casper' | 'circle';

/**
 * Detect which x402 protocol a request is using.
 */
export function detectPaymentProtocol(headers: Headers): PaymentProtocol | null {
  if (headers.get('PAYMENT-SIGNATURE') || headers.get('X-Casper-Payment')) {
    return 'casper';
  }
  if (headers.get('x-402-amount') && headers.get('x-402-payment-intent')) {
    return 'circle';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Multi-Chain 402 Response Builder
// ---------------------------------------------------------------------------

/**
 * Build a 402 Payment Required response advertising all supported protocols.
 */
export function paymentRequiredResponse(
  operation: string,
  priceUSDC: number,
  reason?: string,
): Response {
  return new Response(
    JSON.stringify({
      error: 'Payment required',
      code: 'PAYMENT_REQUIRED',
      service: 'vera-v1',
      details: reason || `This operation requires ${priceUSDC} USDC.`,
      payment_required: {
        casper: {
          network: process.env.CASPER_NETWORK || 'casper:casper-test',
          scheme: 'exact',
          asset: 'USDC (CEP-18)',
          amount: String(priceUSDC),
          operation,
          header: 'PAYMENT-SIGNATURE',
        },
        circle: {
          network: 'eip155:8453',
          gateway: process.env.CIRCLE_GATEWAY_BASE || 'https://api.circle.com/v1',
          token: 'USDC',
          amount: String(priceUSDC),
          operation,
          headers: ['x-402-amount', 'x-402-payment-intent', 'x-402-token', 'x-402-recipient', 'x-402-idempotency-key', 'x-402-expires-at'],
        },
      },
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
        'X-Service-Id': 'vera-v1',
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Address Validation
// ---------------------------------------------------------------------------

export function isValidCasperAddress(address: string): boolean {
  return /^(00|01)[0-9a-fA-F]{64}$/.test(address);
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

// ---------------------------------------------------------------------------
// CORS Headers for x402 routes
// ---------------------------------------------------------------------------

export const X402_ALLOW_HEADERS = [
  'Content-Type',
  'Authorization',
  'PAYMENT-SIGNATURE',
  'X-Casper-Payment',
  'X-Payment-Id',
  'X-Idempotency-Key',
  'X-User-Wallet',
  'x-402-amount',
  'x-402-payment-intent',
  'x-402-token',
  'x-402-recipient',
  'x-402-idempotency-key',
  'x-402-expires-at',
].join(', ');
