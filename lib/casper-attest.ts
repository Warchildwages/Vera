/**
 * Vera — Casper AgentAttest Integration
 *
 * Writes attestation records to the AgentAttest Odra contract
 * on Casper Testnet after Vera evaluates an agent.
 *
 * Architecture:
 *   Agent evaluation → Vera signs result → AgentAttest.record() → deploy hash
 *
 * The deploy hash proves the attestation occurred on-chain and can be
 * verified on https://testnet.cspr.live
 *
 * Dependencies: casper-js-sdk
 */

import crypto from 'node:crypto';
import type { AgentRecord } from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** AgentAttest contract hash on Casper Testnet (set after odra deploy) */
export const AGENT_ATTEST_CONTRACT_HASH =
  process.env.VERA_AGENT_ATTEST_CONTRACT || '';

/** Casper node RPC endpoint */
export const CASPER_RPC_URL =
  process.env.CASPER_RPC_URL || 'https://rpc.testnet.casper.network';

/** Secret key for the Vera agent wallet on Casper */
export const VERA_ATTEST_SECRET_KEY =
  process.env.VERA_ATTEST_SECRET_KEY || '';

export const VERA_ATTEST_PUBLIC_KEY =
  process.env.VERA_ATTEST_PUBLIC_KEY || '';

/** Whether Casper attestation is configured */
export const ATTEST_CONFIGURED =
  Boolean(AGENT_ATTEST_CONTRACT_HASH) &&
  Boolean(VERA_ATTEST_SECRET_KEY) &&
  Boolean(VERA_ATTEST_PUBLIC_KEY);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AttestationRecord {
  agent_id: string;
  operation: string;
  amount: string;
  platform_tx: string;
  timestamp: number;
  proof_hash: string;
  requested_by?: string;
}

export interface AttestationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/** Whether mock mode is active (controlled by env var, defaults to true) */
const MOCK_MODE =
  process.env.VERA_MOCK_MODE !== 'false' && process.env.VERA_MOCK_MODE !== '0';

// ---------------------------------------------------------------------------
// SHA-256 helper
// ---------------------------------------------------------------------------

function sha256(data: string): string {
  return `0x${crypto.createHash('sha256').update(data).digest('hex')}`;
}

// ---------------------------------------------------------------------------
// Attestation Builder
// ---------------------------------------------------------------------------

/**
 * Build an attestation record for a Vera evaluation result.
 */
export function buildAttestationRecord(params: {
  agent: AgentRecord;
  score: number;
  capabilities: string[];
  challengeResponse?: string;
}): AttestationRecord {
  const payload = {
    agentId: params.agent.agentId,
    name: params.agent.name,
    endpoint: params.agent.endpoint,
    capabilities: params.capabilities,
    score: params.score,
    challengeResponse: params.challengeResponse || '',
    timestamp: Math.floor(Date.now() / 1000),
  };

  return {
    agent_id: `vera-v1:${params.agent.agentId}`,
    operation: 'evaluate',
    amount: '0', // Vera is currently free
    platform_tx: sha256(JSON.stringify(payload)),
    timestamp: Math.floor(Date.now() / 1000),
    proof_hash: sha256(JSON.stringify(payload)),
    requested_by: undefined,
  };
}

// ---------------------------------------------------------------------------
// Dynamic Casper SDK loader
// ---------------------------------------------------------------------------

async function loadCasperSdk(): Promise<Record<string, any>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import('casper-js-sdk');
  return (mod.default && Object.keys(mod.default).length > 3)
    ? mod.default
    : mod;
}

// ---------------------------------------------------------------------------
// Write Attestation to Casper Testnet
// ---------------------------------------------------------------------------

/**
 * Write an attestation to the AgentAttest contract on Casper Testnet.
 *
 * Constructs a Casper deploy that calls AgentAttest.record() with the
 * attestation data, signs it with Vera's Ed25519 wallet, and submits
 * to the Casper Testnet.
 *
 * In mock mode (missing keys/contract), returns a simulated deploy hash.
 */
export async function writeAttestation(
  record: AttestationRecord,
  mockMode: boolean = true,
): Promise<AttestationResult> {
  if (mockMode || !ATTEST_CONFIGURED) {
    const simulatedHash = sha256(`mock:${record.agent_id}:${Date.now()}`);
    console.log(
      `[casper-attest] MOCK: ${record.operation} attested — ${simulatedHash.slice(0, 20)}...`,
    );
    return { success: true, transactionHash: simulatedHash };
  }

  try {
    const cs = await loadCasperSdk();
    const { CasperClient, Contracts, RuntimeArgs, DeployUtil, Keys } = cs;

    const casperClient = new CasperClient(CASPER_RPC_URL);

    // Load Vera's Ed25519 key pair
    const keyPair = Keys.Ed25519.parseKeyPair(
      Keys.Ed25519.newPublicKey(VERA_ATTEST_PUBLIC_KEY),
      VERA_ATTEST_SECRET_KEY,
    );

    // Build the deploy
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(
        keyPair.publicKey,
        'casper-test',
        1,
        1_800_000,
      ),
      DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        new Uint8Array(
          Buffer.from(AGENT_ATTEST_CONTRACT_HASH, 'hex'),
        ),
        'record',
        RuntimeArgs.fromMap({
          agent_id: Contracts.stringToCLValue(record.agent_id),
          operation: Contracts.stringToCLValue(record.operation),
          amount: Contracts.stringToCLValue(record.amount),
          platform_tx: Contracts.stringToCLValue(record.platform_tx),
          timestamp: Contracts.u64ToCLValue(record.timestamp),
          proof_hash: Contracts.stringToCLValue(record.proof_hash),
          requested_by: record.requested_by
            ? Contracts.stringToCLValue(record.requested_by)
            : Contracts.optionToCLValue(null),
        }),
      ),
      DeployUtil.getStandardPayment(1_500_000_000),
    );

    // Sign and submit
    const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
    const deployHash = await casperClient.putDeploy(signedDeploy);

    console.log(
      `[casper-attest] ${record.operation} attested: ${deployHash}`,
    );

    return {
      success: true,
      transactionHash: deployHash,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[casper-attest] Failed: ${message}`);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Query Attestations
// ---------------------------------------------------------------------------

/**
 * Query an existing attestation by platform transaction hash.
 */
export async function getAttestation(
  platformTx: string,
): Promise<AttestationRecord | null> {
  if (MOCK_MODE || !ATTEST_CONFIGURED) {
    return null;
  }

  try {
    const cs = await loadCasperSdk();
    const { CasperClient, Contracts } = cs;

    const casperClient = new CasperClient(CASPER_RPC_URL);
    const result = await Contracts.Contract.callEntrypoint(
      casperClient,
      AGENT_ATTEST_CONTRACT_HASH,
      'get_attestation',
      Contracts.RuntimeArgs.fromMap({
        platform_tx: Contracts.stringToCLValue(platformTx),
      }),
      CASPER_RPC_URL,
    );

    if (!result) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result as any;
    return {
      agent_id: data?.agent_id || '',
      operation: data?.operation || '',
      amount: data?.amount || '',
      platform_tx: data?.platform_tx || platformTx,
      timestamp: Number(data?.timestamp) || 0,
      proof_hash: data?.proof_hash || '',
      requested_by: data?.requested_by || undefined,
    };
  } catch {
    return null;
  }
}
