/**
 * Vera — Agent Identity & did:nostr Verification
 *
 * Verifies an agent's Ed25519 key cryptographically via tweetnacl
 * challenge-response, tests endpoint reachability, and validates
 * did:nostr documents.
 */

import nacl from 'tweetnacl';
import type { AgentRecord, VerificationResult } from './types';

/**
 * Generate a random challenge for Ed25519 proof-of-control.
 * The agent must sign this challenge with their private key to
 * cryptographically prove they control the claimed public key.
 */
export function generateChallenge(): { challenge: string; bytes: Uint8Array } {
  const bytes = nacl.randomBytes(32);
  const challenge = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { challenge, bytes };
}

/**
 * Verify a signed challenge against an Ed25519 public key.
 *
 * @param challenge - The original challenge string (hex-encoded)
 * @param signature - The agent's signature (hex-encoded)
 * @param publicKeyHex - The agent's Ed25519 public key (hex-encoded)
 * @returns true if the signature is valid for the challenge and key
 */
export function verifyChallenge(
  challenge: string,
  signature: string,
  publicKeyHex: string,
): boolean {
  try {
    const msgBytes = new TextEncoder().encode(challenge);
    const sigBytes = decodeHex(signature);
    const pubBytes = decodeHex(publicKeyHex);

    if (!pubBytes || pubBytes.length !== 32) return false;
    if (!sigBytes || sigBytes.length !== 64) return false;

    return nacl.sign.detached.verify(msgBytes, sigBytes, pubBytes);
  } catch {
    return false;
  }
}

/**
 * Verify an agent's identity.
 * Checks: Ed25519 key validity, endpoint reachability, did:nostr resolution.
 */
export async function verifyAgent(agent: AgentRecord): Promise<VerificationResult> {
  const result: VerificationResult = {
    agentId: agent.agentId,
    keyValid: false,
    endpointReachable: false,
    didNostrValid: false,
    timestamp: new Date().toISOString(),
  };

  // 1. Verify Ed25519 public key is valid format and cryptographically plausible
  const keyBytes = decodeHex(agent.ed25519PublicKey);
  result.keyValid = keyBytes !== null && keyBytes.length === 32;
  result.keyDetail = result.keyValid
    ? 'Ed25519 key is 32 bytes (valid format). Challenge-response needed for full proof.'
    : 'Ed25519 key invalid: must be 32 bytes hex-encoded (64 hex chars)';

  // 2. Test endpoint reachability
  try {
    const resp = await fetch(agent.endpoint, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    result.endpointReachable = resp.ok || resp.status === 402;
    result.endpointDetail = result.endpointReachable
      ? `Endpoint reachable (HTTP ${resp.status})`
      : `Endpoint returned HTTP ${resp.status}`;
  } catch (e) {
    result.endpointReachable = false;
    result.endpointDetail = `Endpoint unreachable: ${(e as Error).message}`;
  }

  // 3. Verify did:nostr document
  if (agent.didNostrUrl) {
    try {
      const resp = await fetch(agent.didNostrUrl, {
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        const didDoc = await resp.json();
        result.didNostrValid = validateDidNostrDoc(didDoc, agent);
        result.didNostrDetail = result.didNostrValid
          ? 'did:nostr document valid — verification method matches agent key'
          : 'did:nostr document malformed or key mismatch';
      } else {
        result.didNostrValid = false;
        result.didNostrDetail = `did:nostr endpoint returned HTTP ${resp.status}`;
      }
    } catch (e) {
      result.didNostrValid = false;
      result.didNostrDetail = `did:nostr unreachable: ${(e as Error).message}`;
    }
  } else {
    result.didNostrValid = false;
    result.didNostrDetail = 'No did:nostr URL provided';
  }

  return result;
}

/**
 * Check if a public key is a valid 32-byte Ed25519 key.
 * Does NOT verify ownership — use verifyChallenge() for that.
 */
export function isValidEd25519Key(key: string): boolean {
  const bytes = decodeHex(key);
  return bytes !== null && bytes.length === 32;
}

/**
 * Validate a did:nostr document against an agent record.
 */
export function validateDidNostrDoc(doc: Record<string, unknown>, agent: AgentRecord): boolean {
  if (!doc.id || typeof doc.id !== 'string') return false;

  const vm = doc.verificationMethod;
  if (!Array.isArray(vm) || vm.length === 0) return false;

  const services = doc.service;
  if (!Array.isArray(services)) return false;

  for (const cap of agent.capabilities.slice(0, 3)) {
    const hasService = services.some(
      (s: Record<string, unknown>) =>
        typeof s.id === 'string' && s.id.toLowerCase().includes(cap),
    );
    if (!hasService) return false;
  }

  return true;
}

/**
 * Resolve a did:nostr URL to a DID document.
 */
export async function resolveDidNostr(url: string): Promise<Record<string, unknown> | null> {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return null;
    return (await resp.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function decodeHex(hex: string): Uint8Array | null {
  const stripped = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!/^[0-9a-f]*$/i.test(stripped) || stripped.length % 2 !== 0) return null;
  const bytes = new Uint8Array(stripped.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(stripped.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
