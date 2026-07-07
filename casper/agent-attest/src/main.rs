//! AgentAttest — On-Chain Agent Attestation Contract
//!
//! Built with Odra 2.0 for the Casper Network.
//! Records agent evaluations as on-chain attestations.
//!
//! Entry Points:
//!   - record(agent_id, operation, amount, platform_tx, timestamp, proof_hash, requested_by)
//!   - get_attestation(platform_tx) -> AttestationRecord
//!   - agent_attestation_count(agent_id) -> u64
//!   - total_attestations() -> u64
//!
//! Deploy:
//!   odra deploy --node-address http://rpc.testnet.casper.network:7777 \
//!     --secret-key path/to/key.pem \
//!     --session agent-attest.wasm

use odra::types::{Address, U512};
use odra::{contract_env, execution_env, IterableMapping, Variable};
use odra::prelude::*;

/// A single attestation record stored on-chain.
#[odra::odra_type]
#[derive(Default, Debug, Clone)]
pub struct AttestationRecord {
    pub agent_id: String,
    pub operation: String,
    pub amount: String,
    pub platform_tx: String,
    pub timestamp: u64,
    pub proof_hash: String,
    pub requested_by: Option<String>,
}

/// AgentAttest contract.
#[odra::module]
pub struct AgentAttest {
    /// Count of all attestations ever recorded.
    total_count: Variable<u64>,
    /// Per-agent attestation counter.
    agent_counts: IterableMapping<String, u64>,
    /// Attestation records keyed by platform_tx hash.
    attestations: IterableMapping<String, AttestationRecord>,
}

#[odra::module]
impl AgentAttest {
    /// Record a new attestation.
    /// Emits an `AttestationRecorded` event.
    #[odra( payable)]
    pub fn record(
        &mut self,
        agent_id: String,
        operation: String,
        amount: String,
        platform_tx: String,
        timestamp: u64,
        proof_hash: String,
        requested_by: Option<String>,
    ) {
        // Ensure the platform_tx is unique (no double-attestation)
        let exists = self.attestations.get(&platform_tx);
        if exists.is_some() {
            contract_env::revert(Error::AttestationAlreadyExists);
        }

        let record = AttestationRecord {
            agent_id: agent_id.clone(),
            operation,
            amount,
            platform_tx: platform_tx.clone(),
            timestamp,
            proof_hash,
            requested_by,
        };

        self.attestations.set(&platform_tx, record);

        // Increment counts
        let current = self.agent_counts.get(&agent_id).unwrap_or(0);
        self.agent_counts.set(&agent_id, current + 1);
        let total = self.total_count.get_or_default();
        self.total_count.set(total + 1);
    }

    /// Get an attestation by its platform transaction hash.
    pub fn get_attestation(&self, platform_tx: String) -> Option<AttestationRecord> {
        self.attestations.get(&platform_tx)
    }

    /// Get the total number of attestations for a given agent.
    pub fn agent_attestation_count(&self, agent_id: String) -> u64 {
        self.agent_counts.get(&agent_id).unwrap_or(0)
    }

    /// Get the total number of attestations recorded by this contract.
    pub fn total_attestations(&self) -> u64 {
        self.total_count.get_or_default()
    }
}

/// Error codes for the AgentAttest contract.
#[odra::odra_error]
pub enum Error {
    AttestationAlreadyExists = 0,
    InsufficientPayment = 1,
}
