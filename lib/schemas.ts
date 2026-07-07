import { z } from 'zod';

/** Schema for POST /api/report — Submit a reputation event */
export const ReportSchema = z.object({
  agentId: z.string().min(1, 'agentId is required'),
  type: z.enum(['transaction', 'dispute', 'report', 'verification']),
  outcome: z.enum(['positive', 'negative', 'neutral', 'pending']),
  source: z.string().min(1, 'source is required'),
  detail: z.string().min(1, 'detail is required'),
  eventId: z.string().optional(),
  evidenceCid: z.string().optional(),
  timestamp: z.string().optional(),
});

/** Schema for POST /api/evaluate — Run evaluation */
export const EvaluateSchema = z.object({
  capability: z.string().optional(),
});

/** Schema for POST /api/verify/challenge — Challenge-response verification */
export const ChallengeResponseSchema = z.object({
  agentId: z.string().min(1),
  challenge: z.string().regex(/^[0-9a-f]{64}$/, 'challenge must be 64 hex chars (32 bytes)'),
  signature: z.string().regex(/^[0-9a-f]{128}$/, 'signature must be 128 hex chars (64 bytes)'),
  publicKey: z.string().regex(/^[0-9a-f]{64}$/, 'publicKey must be 64 hex chars (32 bytes)'),
});
