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
  challenge: z.string().min(1, 'challenge is required'),
  signature: z.string().min(1, 'signature is required'),
  publicKey: z.string().min(1, 'publicKey is required'),
});
